import {getBusiness} from '@/lib/business-data';
import {getDossier} from '@/financial-models/catalog';
import {withOverrides} from '@/financial-models/engine';
import {buildDossierPdf} from '@/lib/financial-pdf';
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,b=getBusiness(slug);if(!b)return new Response('Usaha tidak ditemukan',{status:404});
 const d=getDossier(b.id),url=new URL(request.url),value=url.searchParams.get('revenue');
 if(value!==null&&(!Number.isFinite(Number(value))||Number(value)<0))return new Response('Pendapatan tidak valid',{status:400});
 const units=value===null?d.model.inputs.units.value:Number(value)*1e6/(d.model.inputs.ticket.value*(d.model.mode==='membership'?1:d.model.inputs.days.value));
 if(units>d.model.capacity)return new Response('Volume melampaui kapasitas model. Gunakan pengaturan di halaman usaha.',{status:400});
 const model=withOverrides(d.model,{units});model.location=(url.searchParams.get('city')??'Nasional').slice(0,100)+' — biaya lokal belum disurvei';
 const blob=buildDossierPdf(d,model);return new Response(await blob.arrayBuffer(),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="cek-bisnis-${slug}-model.pdf"`,'Cache-Control':'no-store'}});
}
