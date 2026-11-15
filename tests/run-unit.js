/* Reproduce all model regressions without browser dependencies. */
const {readdirSync}=require('node:fs');
const {join}=require('node:path');
const {spawnSync}=require('node:child_process');
const suites=readdirSync(__dirname).filter(name=>name.endsWith('.cjs')).sort();
let failures=0;
for(const name of suites){
 const result=spawnSync(process.execPath,[join(__dirname,name)],{encoding:'utf8',timeout:10000});
 if(result.error||result.status!==0){failures++;process.stderr.write('FAIL '+name+'\n'+(result.stdout||'')+(result.stderr||'')+(result.error?.message||'')+'\n');}
}
console.log(`${suites.length-failures}/${suites.length} unit suites passed`);
if(failures)process.exitCode=1;
