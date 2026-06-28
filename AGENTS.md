<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:workspace-layout-rules -->
# Workspace File Structure Standards

Maintain an industry-standard multi-service monorepo directory layout:
1. **Frontend**: Next.js React frontend files must remain isolated within the `ksp-crime-portal/` folder.
2. **Backend**: FastAPI Python backend files must remain isolated within the `ksp-crime-analytics-backend/` folder.
3. **Workspace Root**: Root-level execution should use npm workspaces to run or build sub-projects. Do not place application source files directly in the root of the workspace.
<!-- END:workspace-layout-rules -->
