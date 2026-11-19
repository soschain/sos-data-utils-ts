// Flow contract: the public SOS data vocabulary exports the canonical environmental care sector.
import assert from 'node:assert/strict';
import test from 'node:test';
import { DataspaceSectors } from 'sos-data-utils-ts/dataspace-sectors';

test('exports the One Health care identifier for environmental organizations', () => {
  assert.equal(DataspaceSectors.OneHealthCare, 'onehealth-care');
});
