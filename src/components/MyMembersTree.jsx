import { useState, useEffect, useContext, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { AuthContext } from "../context/AuthContext";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { toast } from "sonner";

const NODE_WIDTH = 155;
const NODE_HEIGHT = 56;
const HORIZONTAL_GAP = 14;
const VERTICAL_GAP = 45;

const CustomOrgNode = ({ data }) => {
  const isDeactivated = !!data.deactivated;
  const isSelected = !!data.isSelected;

  return (
    <div
      className={`rounded overflow-hidden border transition-all select-none shadow-xs cursor-pointer w-[155px] text-center ${
        isSelected
          ? "ring-2 ring-yellow-400 border-yellow-400 shadow-sm scale-102"
          : isDeactivated
          ? "border-rose-600"
          : "border-[#1F2766]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 pointer-events-none"
      />

      {/* Top Heading */}
      <div
        className={`px-1.5 py-1 text-[10px] font-bold text-white text-wrap uppercase leading-tight ${
          isDeactivated ? "bg-rose-600" : "bg-[#1F2766]"
        }`}
      >
        {data.name}
      </div>

      {/* Bottom Content */}
      <div
        className={`px-1.5 py-1 text-[10px] font-bold bg-white dark:bg-dark-bg text-black dark:text-white border-t ${
          isDeactivated
            ? "border-rose-600 text-rose-700 dark:text-rose-400"
            : "border-[#1F2766] text-black dark:text-white"
        }`}
      >
        {data.title}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 pointer-events-none"
      />
    </div>
  );
};

function AutoFitTree({ nodes }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [nodes, fitView]);

  return null;
}

function getTreeLayout(treeRoot, selectedAgentId) {
  if (!treeRoot || !treeRoot.id) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  function computeSubtreeWidth(node) {
    if (!node.children || node.children.length === 0) {
      node._subtreeWidth = NODE_WIDTH;
      return NODE_WIDTH;
    }
    let width = 0;
    node.children.forEach((child, index) => {
      width += computeSubtreeWidth(child);
      if (index < node.children.length - 1) {
        width += HORIZONTAL_GAP;
      }
    });
    node._subtreeWidth = Math.max(NODE_WIDTH, width);
    return node._subtreeWidth;
  }

  computeSubtreeWidth(treeRoot);

  function assignPositions(node, leftX, depth) {
    const subtreeWidth = node._subtreeWidth;
    let nodeX;

    if (!node.children || node.children.length === 0) {
      nodeX = leftX + (subtreeWidth - NODE_WIDTH) / 2;
    } else {
      let currentLeft = leftX;
      node.children.forEach((child) => {
        assignPositions(child, currentLeft, depth + 1);
        currentLeft += child._subtreeWidth + HORIZONTAL_GAP;
      });
      const firstChildX = node.children[0]._x;
      const lastChildX = node.children[node.children.length - 1]._x;
      nodeX = (firstChildX + lastChildX) / 2;
    }

    node._x = nodeX;
    const nodeY = depth * (NODE_HEIGHT + VERTICAL_GAP);

    const isSelected = String(node.id) === String(selectedAgentId);

    nodes.push({
      id: String(node.id),
      type: "customOrgNode",
      position: { x: nodeX, y: nodeY },
      data: {
        id: node.id,
        name: node.name,
        title: node.title,
        deactivated: node.deactivated,
        isSelected: isSelected,
        rawNode: node,
      },
    });

    if (node.children) {
      node.children.forEach((child) => {
        edges.push({
          id: `e-${node.id}-${child.id}`,
          source: String(node.id),
          target: String(child.id),
          type: "smoothstep",
          pathOptions: { borderRadius: 0 },
          style: { stroke: "#1F2766", strokeWidth: 2 },
        });
      });
    }

  }

  assignPositions(treeRoot, 0, 0);

  return { nodes, edges };
}

const MyMembersTree = ({
  agentDatabaseId,
  setAgentDatabaseId,
  setSelectedAgentData,
}) => {
  const { agentId } = useContext(AuthContext);
  const [chartData, setChartData] = useState(null);
  const [childParent, setChildParent] = useState([]);
  const [tempChartData, setTempChartData] = useState(null);

  const nodeTypes = useMemo(() => ({ customOrgNode: CustomOrgNode }), []);

  const transformData = (data) => {
    if (!data) return null;
    const transformed = {
      id: data?.id,
      name: `${data?.name || ""} (${data?.smallid || "-"})`,
      title: `(${data?.rankid || "-"}) ${data?.rank || ""}`,
      deactivated: !!data?.deactivated,
      children: data?.children ? data?.children?.map(transformData) : [],
    };
    return transformed;
  };

  const getMembersAccounts = async (agentId, options) => {
    let response = await getServerData(
      `agents/childrenHierarchyNextLine/${agentId}`,
      null,
      options
    );
    if (response?.cancelled) {
      return;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        const transformed = transformData(response?.data?.data);
        setChartData(transformed);
        setTempChartData(transformed);
      } else {
        setChartData(null);
        toast.error(response?.message || "Data Fetching Failed");
      }
    } else {
      setChartData(null);
      toast.error(response?.message || "Data Fetching Failed");
    }
  };

  const NodeClicked = (e) => {
    setChildParent((prev) => {
      const childExists = prev?.some((item) => item?.child?.id === e?.id);
      if (!childExists) {
        return [
          ...prev,
          {
            parent: { ...tempChartData, children: [] },
            child: { ...e },
          },
        ];
      }
      return prev;
    });
    setSelectedAgentData(e);
    setAgentDatabaseId(e?.id);
  };

  useAbortableEffect(
    (signal) => {
      getMembersAccounts(agentDatabaseId, { signal });
    },
    [agentDatabaseId]
  );

  useEffect(() => {
    if (childParent && tempChartData) {
      if (agentDatabaseId === agentId) {
        setChartData({ ...tempChartData });
        return;
      }
      for (let i = 0; i < childParent?.length; i++) {
        if (childParent[i]?.child?.id === agentDatabaseId) {
          setChartData({
            id: childParent[i]?.parent?.id,
            name: childParent[i]?.parent?.name,
            title: childParent[i]?.parent?.title,
            children: [{ ...tempChartData }],
          });
          return;
        }
      }
    }
  }, [childParent, tempChartData]);

  const { nodes, edges } = useMemo(
    () => getTreeLayout(chartData, agentDatabaseId),
    [chartData, agentDatabaseId]
  );

  return (
    <div className="flex flex-col justify-center items-center w-full my-6">
      <style>{`.react-flow__attribution { display: none !important; }`}</style>
      {tempChartData && (
        <p className="text-brand dark:text-indigo-300 font-bold mb-3 text-sm">
          Selected Agent :-{" "}
          <span className="text-black dark:text-white font-normal">
            {tempChartData?.name}
          </span>
        </p>
      )}

      <div className="w-full h-[450px] border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-dark-bg overflow-hidden shadow-sm">
        {nodes.length > 0 ? (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => {
                if (node?.data?.rawNode) {
                  NodeClicked(node.data.rawNode);
                }
              }}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              panOnDrag={true}
              zoomOnScroll={true}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <AutoFitTree nodes={nodes} />
            </ReactFlow>
          </ReactFlowProvider>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-black/50 dark:text-white/50">
            No Hierarchy Data Found
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMembersTree;
