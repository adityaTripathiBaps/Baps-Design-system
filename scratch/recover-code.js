const fs = require('fs');
const transcript = fs.readFileSync('C:/Users/PC/.gemini/antigravity-ide/brain/dfbbab52-e0f8-4c05-a399-74ad1011dafa/.system_generated/logs/transcript_full.jsonl', 'utf8');

const lines = transcript.split('\n');
for (const line of lines) {
  if (!line) continue;
  try {
    const step = JSON.parse(line);
    if (step.tool_responses) {
      for (const res of step.tool_responses) {
        if (res.output && res.output.includes('function Checkbox')) {
          console.log('Found Checkbox in output at step', step.step_index);
          fs.writeFileSync('d:/baps-projects/baps-design-system/scratch/recovered-code.txt', res.output, 'utf8');
        }
      }
    }
  } catch (e) {}
}
console.log('Done searching.');
