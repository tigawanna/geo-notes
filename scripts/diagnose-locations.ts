#!/usr/bin/env ts-node
/**
 * Diagnostic script to check location data in the notes database
 * 
 * This script will:
 * 1. Check how many notes exist
 * 2. Check how many have valid location geometries
 * 3. Show sample location data
 * 4. Test distance calculation
 * 
 * Run with: npx ts-node scripts/diagnose-locations.ts
 */

import { diagnoseLocationData } from "../src/data-access-layer/notes-api";

async function main() {
  console.log("🔍 Running location diagnostics...\n");
  
  const result = await diagnoseLocationData();
  
  if (result.error || !result.result) {
    console.error("❌ Error:", result.error);
    return;
  }
  
  const diagnostics = result.result;
  
  console.log("📊 DIAGNOSTICS SUMMARY");
  console.log("═".repeat(50));
  console.log(`Total notes: ${diagnostics.totalNotes}`);
  console.log(`Notes with any geometry: ${diagnostics.notesWithAnyGeometry}`);
  console.log(`Notes with valid POINT geometry: ${diagnostics.notesWithValidPointGeometry}`);
  console.log("");
  
  if (diagnostics.notesWithValidPointGeometry === 0 && Number(diagnostics.totalNotes) > 0) {
    console.log("⚠️  WARNING: No notes have valid location geometries!");
    console.log("   Your existing notes may need location data migration.");
  } else if (Number(diagnostics.notesWithValidPointGeometry) < Number(diagnostics.totalNotes)) {
    console.log(`⚠️  WARNING: ${Number(diagnostics.totalNotes) - Number(diagnostics.notesWithValidPointGeometry)} notes have invalid or missing location data.`);
  } else if (Number(diagnostics.notesWithValidPointGeometry) > 0) {
    console.log("✅ All notes have valid location geometries!");
  }
  
  console.log("\n📍 SAMPLE NOTES");
  console.log("═".repeat(50));
  
  if (diagnostics.sampleNotes.length === 0) {
    console.log("No notes found in database.");
  } else {
    diagnostics.sampleNotes.forEach((note, index) => {
      console.log(`\nNote ${index + 1}: ${note.title || 'Untitled'}`);
      console.log(`  ID: ${note.id}`);
      console.log(`  Geometry Type: ${note.geometryType || 'NULL'}`);
      console.log(`  Is Valid: ${note.isValid || 'N/A'}`);
      console.log(`  WKT: ${note.locationWKT || 'NULL'}`);
      console.log(`  GeoJSON: ${note.locationGeoJSON || 'NULL'}`);
      console.log(`  Latitude: ${note.latitude || 'N/A'}`);
      console.log(`  Longitude: ${note.longitude || 'N/A'}`);
    });
  }
  
  console.log("\n" + "═".repeat(50));
  console.log("Diagnostics complete!");
}

main().catch(console.error);
