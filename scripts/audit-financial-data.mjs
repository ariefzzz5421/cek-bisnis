import fs from 'node:fs';
const read = (name) => JSON.parse(fs.readFileSync(`data/${name}.json`, 'utf8'));
const base = read('franchise-data');
const extra = read('franchise-extra');
const businesses = read('business-data').businesses;
const brands = [...new Map([...base.franchises, ...extra.franchises].map(x => [x.id, x])).values()];
const fields = ['investment','franchiseFee','royalty','monthlyRevenue','transactions','avgTicket','variableRate','grossMargin','payroll','rent','utilities','logistics','marketing','maintenance','recurringFees','workingCapital','bepMonths','payback','ROI','operatingMargin','contractYears','storeSize','staffCount','equipment','risks'];
const entries = [...brands.map(x => ({kind:'franchise',...x})), ...businesses.map(x=>({kind:'business',...x}))].map(x => ({
  id:x.id, name:x.name, kind:x.kind,
  fields:Object.fromEntries(fields.map(field => [field, {previous:x[field] ?? null, status:x[field] == null ? 'missing' : 'unattributed', issue: 'No field-level dated evidence; must not be treated as an official fact.'}])),
  sourceIds:x.sourceIds ?? [],
}));
fs.mkdirSync('research', {recursive:true});
fs.writeFileSync('research/legacy-audit.json',JSON.stringify({auditedAt:'2026-09-08',baseCommit:'e707dcf',scope:{franchises:brands.length,businesses:businesses.length},note:'Immutable pre-migration snapshot; unattributed is not the same as false. See registry.ts for reviewed evidence and model classifications.',entries},null,2)+'\n');
console.log(`Audited ${brands.length} franchises and ${businesses.length} businesses across ${fields.length} financial/operational fields.`);
