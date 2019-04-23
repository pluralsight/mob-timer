# Test structure

## Integration tests

In this folder (`/test`) you should only put integration tests that care equally about several modules, or tests that don't relate to any single module.

Example: _The tests in `node-version.test.js` make sure that the node.js versions are consistent in tests, in the app and in the CI._

## Unit tests

For unit tests, co-locate the test next to the module under test. Tests that are integration tests but have a clear main module under test could also be co-located.

Example: _The tests in `timer.test.js` check that the module `timer.js` behaves correctly, and both files are located in the same folder (somewhere inside the `src/` folder)._