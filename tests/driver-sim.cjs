const assert = require('node:assert/strict');
const {driverPrograms, runDriverProgram} = require('../driver-sim.js');

for (const [kind, program] of Object.entries(driverPrograms)) {
 const broken = runDriverProgram(kind, program.fault);
 assert.equal(broken.valid, true, kind);
 assert.equal(broken.success, false, kind);
 assert.ok(broken.trace.length, kind);
 assert.equal(runDriverProgram(kind, program.repair).success, true, kind);
 assert.equal(runDriverProgram(kind, program.fault).success, false, 'each run resets state');
}
assert.equal(runDriverProgram('transfer',
 'write_trbs();\npublish_cycle();\nwrite_barrier();\nring_endpoint();').success, false);
assert.equal(runDriverProgram('transfer',
 'write_barrier();\nwrite_trbs();\npublish_cycle();\nring_endpoint();').success, false);
assert.equal(runDriverProgram('cmd',
 'ring_doorbell();\nqueue_command();\nring_doorbell();\npoll_event();').success, true);
assert.equal(runDriverProgram('port',
 'prepare_reset();\nwrite_portsc();\nread_portsc(); // sample').state.portObserved, true);
assert.equal(runDriverProgram('event',
 'read_barrier();\ncheck_cycle();\nread_event();').state.eventType, 32);
assert.equal(runDriverProgram('event', 'alert(1);').valid, false);
assert.equal(runDriverProgram('cmd', 'write_portsc();').valid, false);
console.log('PASS isolated driver replay: syntax, missing operations, ordering, and recovery');
