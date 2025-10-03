const fs=require('fs');
const path='/Volumes/T5_Sumrendra/Dev/Projects/productivity-hub/src/components/components-bundle.js';
const s=fs.readFileSync(path,'utf8');
let stack=[]; let line=1,col=0;
for (let i=0;i<s.length;i++){
  const ch=s[i];
  if(ch==='\n'){ line++; col=0; continue; } else col++;
  if (ch==='('||ch==='{'||ch==='['){ stack.push({ch, line, col}); }
  if (ch===')'||ch==='}'||ch===']'){
    const match={')':'(',']':'[','}':'{'}[ch];
    if(!stack.length||stack[stack.length-1].ch!==match){
      console.log('Unmatched', ch, 'at', line, col, 'stack top:', stack[stack.length-1]);
      process.exit(0);
    } else { stack.pop(); }
  }
}
console.log('Done. Stack size:', stack.length);
if(stack.length){ console.log('Unclosed from', stack.slice(-5)); }
