/** Compatibility entrypoint: static and on-demand PDFs now share the deterministic model. */
import {execFileSync} from 'node:child_process';
execFileSync(process.platform==='win32'?'npx.cmd':'npx',['tsx','scripts/research-report.ts'],{stdio:'inherit',shell:process.platform==='win32'});
