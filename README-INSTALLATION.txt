MESSENJ — FICHYE AK ENSTALASYON

Fichye nan pake sa a:
- index.html : paj HTML aplikasyon an
- script.js : JavaScript aplikasyon an
- style.css : aparans/responsive design
- supabase-schema.sql : tab ak règleman RLS ki koresponn ak non kolòn script la

ENSTALASYON
1. Kenbe twa fichye index.html, script.js, style.css ansanm nan menm dosye.
2. Pou Vercel, mete yo nan pwojè a epi redeploy.
3. Nan Supabase, ale nan SQL Editor, verifye fichye supabase-schema.sql anvan ou kouri li. Si ou deja gen tab ki gen done, pa efase tab yo; konpare kolòn yo anvan.
4. Supabase Authentication dwe pèmèt Email/Password.
5. Pou mesaj an tan reyèl, aktive Realtime pou tab messages ak statuses si script la itilize subscriptions.

ENPÒTAN
Kòd kliyan an sèvi ak Supabase URL ak publishable key ki nan script.js. Publishable/anon key la fèt pou kliyan, men sekirite a dwe fèt ak RLS. Pa mete service_role/secret key nan script.js.

SQL la se yon modèl konpatibilite. Li pa ka verifye otomatikman sa ki deja nan pwojè Supabase ou a. Si tab ou yo deja egziste ak lòt kolòn, adapte yo olye ou ranplase done yo.
