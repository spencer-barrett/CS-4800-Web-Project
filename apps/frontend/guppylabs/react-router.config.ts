import {
  type RouteConfig,
  route,
  index,
  layout
} from "@react-router/dev/routes";



export default [
  layout("./layouts/app-layout.tsx", [
      index("./pages/home.tsx"),
      route("about", "./pages/about.tsx"),
      route("staff", "./pages/staff.tsx"),
      route("projects", "./pages/projects.tsx")
  ]),
] satisfies RouteConfig
