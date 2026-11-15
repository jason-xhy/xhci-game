const a=require('node:assert/strict'),check=require('../speed.js');
for(const speed of ['Low','Full'])for(const mtt of [0,1]){const c={parent:2,port:3,mtt},h={isHub:true,mtt};a.match(check(speed,false,c,h),/^Success/);a.match(check(speed,false,c,{...h,isHub:false}),/^Parameter Error/);for(const key of ['parent','port','mtt'])a.match(check(speed,false,{...c,[key]:99},h),/^Rejected/);a.match(check(speed,true,c,h),/^Rejected/);}
for(const speed of ['Low','Full','High'])a.match(check(speed,true,{parent:0,port:0,mtt:0},{}),/^Success/);
a.match(check('High',false,{parent:0,port:0,mtt:0},{}),/^Success/);console.log('speed topology and TT checks pass');
