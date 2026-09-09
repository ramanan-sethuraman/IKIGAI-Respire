import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { geeService, GEE_PALETTES } from '../geeService';

console.log('================================================================');
console.log('RESPIRE GOOGLE EARTH ENGINE (GEE) TEST SUITE');
console.log('================================================================');

// Test 1: GEE Metadata for Landsat 9
const landsatMeta = geeService.getSatelliteTelemetryMetadata('landsat_lst');
assert.ok(landsatMeta.sensor.includes('Thermal Infrared Sensor 2 (TIRS-2)'), 'Landsat 9 sensor must be TIRS-2');
assert.equal(landsatMeta.nominalResolution, '30m (TIRS 100m resampled)', 'Nominal resolution must be 30m');
assert.ok(landsatMeta.cloudCoverPercentage < 5.0, 'Cloud cover should be minimal');
console.log('  ✅ [PASS] Test 1: Landsat 9 TIRS satellite telemetry metadata verified');

// Test 2: GEE Metadata for ECOSTRESS
const ecostressMeta = geeService.getSatelliteTelemetryMetadata('ecostress_lst');
assert.ok(ecostressMeta.sensor.includes('ECOSTRESS'), 'ECOSTRESS sensor identified');
assert.equal(ecostressMeta.nominalResolution, '70m × 70m', 'ECOSTRESS resolution is 70m');
assert.ok(ecostressMeta.diurnalCaptureTime.includes('13:42 IST'), 'ECOSTRESS captures peak afternoon thermal radiance');
console.log('  ✅ [PASS] Test 2: ECOSTRESS diurnal heat telemetry verified');

// Test 3: GEE Metadata for Sentinel-2 NDVI
const sentinelMeta = geeService.getSatelliteTelemetryMetadata('sentinel_ndvi');
assert.ok(sentinelMeta.sensor.includes('MultiSpectral Instrument (MSI)'), 'Sentinel-2 MSI identified');
assert.equal(sentinelMeta.nominalResolution, '10m × 10m', 'Sentinel-2 optical resolution is 10m');
console.log('  ✅ [PASS] Test 3: Sentinel-2 NDVI 10m vegetation telemetry verified');

// Test 4: Empirical Chennai Thermal Hotspots
const hotspots = geeService.getThermalHotspots();
assert.ok(hotspots.length >= 8, 'At least 8 empirical thermal hotspots defined across GCC');
const manali = hotspots.find(h => h.id === 'hotspot-01');
assert.ok(manali, 'Manali industrial hotspot present');
assert.ok(manali.measuredLstCelsius >= 47.0, 'Manali measured LST is extreme (>=47°C)');
console.log(`  ✅ [PASS] Test 4: Thermal hotspots catalog loaded (${hotspots.length} hotspots, Manali LST: ${manali.measuredLstCelsius}°C)`);

// Test 5: Spatial Temperature Estimation
const northChennaiTemp = geeService.calculateEstimatedTemperature(13.165, 80.258, 'landsat_lst');
const coastalTemp = geeService.calculateEstimatedTemperature(13.001, 80.275, 'landsat_lst');
assert.ok(northChennaiTemp > coastalTemp, `Inland/Industrial heat (${northChennaiTemp}°C) must exceed coastal temperature (${coastalTemp}°C)`);
console.log(`  ✅ [PASS] Test 5: Microclimatic spatial gradient verified (North Industrial: ${northChennaiTemp}°C vs Coastal: ${coastalTemp}°C)`);

// Test 6: Palette Configuration Completeness
assert.ok(GEE_PALETTES.landsat_lst.colors.length >= 5, 'Landsat palette has 5+ color stops');
assert.ok(GEE_PALETTES.ecostress_lst.max === 50, 'ECOSTRESS max scale is 50°C');
assert.ok(GEE_PALETTES.sentinel_ndvi.min === 0.05, 'Sentinel NDVI min scale is 0.05');
console.log('  ✅ [PASS] Test 6: GEE Palette color scales and temperature thresholds verified');

console.log('================================================================');
console.log('ALL GEE SATELLITE ENGINE TESTS PASSED');
console.log('================================================================');
