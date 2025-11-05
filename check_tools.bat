@echo off
echo python3: 
where python3 >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo php: 
where php >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo uv: 
where uv >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo composer: 
where composer >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo node: 
where node >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo pnpm: 
where pnpm >nul 2>&1 && echo   ✓ found || echo   ✗ not found
echo docker: 
where docker >nul 2>&1 && echo   ✓ found || echo   ✗ not found