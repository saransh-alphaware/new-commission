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

function calculateTreePositions(
  treeRoot,
  nodeWidth = NODE_WIDTH,
  nodeHeight = NODE_HEIGHT,
  hSpacing = 30,
  vSpacing = 45
) {
  if (!treeRoot || !treeRoot.id) return new Map();

  const nodePosMap = new Map();
  const depthNextX = new Map();

  function layoutNode(node, depth = 0) {
    const y = depth * (nodeHeight + vSpacing);

    if (!node.children || node.children.length === 0) {
      const currentNextX = depthNextX.get(depth) || 0;
      const x = currentNextX;
      depthNextX.set(depth, x + nodeWidth + hSpacing);
      nodePosMap.set(String(node.id), { x, y });
      return x;
    }

    const childXPositions = node.children.map((child) =>
      layoutNode(child, depth + 1)
    );

    const firstChildX = childXPositions[0];
    const lastChildX = childXPositions[childXPositions.length - 1];
    let centeredX = (firstChildX + lastChildX) / 2;

    const minX = depthNextX.get(depth) || 0;
    let shiftX = 0;
    if (centeredX < minX) {
      shiftX = minX - centeredX;
      centeredX = minX;
    }

    if (shiftX > 0) {
      shiftSubtree(node, shiftX, depth + 1);
    }

    depthNextX.set(depth, centeredX + nodeWidth + hSpacing);
    nodePosMap.set(String(node.id), { x: centeredX, y });
    return centeredX;
  }

  function shiftSubtree(node, shiftX, depth) {
    if (!node.children || node.children.length === 0) return;
    node.children.forEach((child) => {
      const pos = nodePosMap.get(String(child.id));
      if (pos) {
        nodePosMap.set(String(child.id), { x: pos.x + shiftX, y: pos.y });
      }
      shiftSubtree(child, shiftX, depth + 1);
    });
    const currentNextX = depthNextX.get(depth) || 0;
    depthNextX.set(depth, currentNextX + shiftX);
  }

  layoutNode(treeRoot, 0);
  return nodePosMap;
}

const CustomOrgNode = ({ data }) => {
  const isDeactivated = !!data.deactivated;
  const isSelected = !!data.isSelected;

  return (
    <div
      className={`rounded overflow-hidden border transition-all select-none shadow-xs cursor-pointer w-[155px] h-[56px] flex flex-col justify-between text-center ${
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

const OrgTreeEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}) => {
  const centerY = sourceY + (targetY - sourceY) / 2;
  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${centerY} L ${targetX} ${centerY} L ${targetX} ${targetY}`;

  return (
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
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

function buildRawNodesAndEdges(treeRoot, selectedAgentId) {
  if (!treeRoot || !treeRoot.id) return { rawNodes: [], rawEdges: [] };

  const rawNodes = [];
  const rawEdges = [];

  function traverse(node) {
    const isSelected = String(node.id) === String(selectedAgentId);

    rawNodes.push({
      id: String(node.id),
      type: "customOrgNode",
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
        rawEdges.push({
          id: `e-${node.id}-${child.id}`,
          source: String(node.id),
          target: String(child.id),
          type: "treeEdge",
          style: { stroke: "#1F2766", strokeWidth: 2 },
        });
        traverse(child);
      });
    }
  }

  traverse(treeRoot);
  return { rawNodes, rawEdges };
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
  const edgeTypes = useMemo(() => ({ treeEdge: OrgTreeEdge }), []);

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

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!chartData || !chartData.id) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { rawNodes, rawEdges } = buildRawNodesAndEdges(chartData, agentDatabaseId);
    const nodePosMap = calculateTreePositions(chartData);

    const layoutedNodes = rawNodes.map((node) => ({
      ...node,
      position: nodePosMap.get(node.id) || { x: 0, y: 0 },
    }));

    setNodes(layoutedNodes);
    setEdges(rawEdges);
  }, [chartData, agentDatabaseId]);

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

      <div className="w-full h-[300px] border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-dark-bg overflow-hidden shadow-sm">
        {nodes.length > 0 ? (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
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
