import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { nanoid } from "../utils/nanoid";

const insertSpaces = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/-/g, " ");
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location?.pathname?.split("/")?.filter((x) => x);
  const pageName = pathnames[pathnames?.length - 1];

  return (
    <div className="flex flex-col md:flex-row md:space-x-2 md:items-center text-black dark:text-white mb-4">
      {pathnames?.length > 0 && (
        <p className="text-2xl font-[900] capitalize text-black dark:text-white">
          {insertSpaces(pageName)}
        </p>
      )}
      <ol className="inline-flex items-end mx-4 gap-2">
        {pathnames?.length > 0 && (
          <li key={nanoid()} className="text-sm capitalize">
            <Link to="/" className="hover:text-brand dark:hover:text-cyan-400 transition-colors">
              Home
            </Link>
          </li>
        )}
        {pathnames.map((value, index) => {
          const to = `/${pathnames?.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames?.length - 1;

          return isLast ? (
            <Fragment key={nanoid()}>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <li
                className="text-sm capitalize text-gray-600 dark:text-gray-300 font-medium"
                aria-current="page"
              >
                {insertSpaces(value)}
              </li>
            </Fragment>
          ) : (
            <Fragment key={nanoid()}>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              {value === "details" || value === "update" ? (
                <li className="text-sm capitalize text-gray-600 dark:text-gray-300">
                  {insertSpaces(value)}
                </li>
              ) : (
                <li className="text-sm capitalize">
                  <Link to={to} className="hover:text-brand dark:hover:text-cyan-400 transition-colors">
                    {insertSpaces(value)}
                  </Link>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
};

export default Breadcrumbs;

