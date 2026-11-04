// Punto Gambeta Gym · Adaptador Supabase <-> localStorage
// Uso: incluir supabase-config.js + CDN supabase-js + este archivo.
// Si no hay claves, todo sigue en localStorage (sin romper nada).
// Requiere internet (es backend en la nube).
/* eslint-disable */
(function(){
  const hasCfg = (typeof SUPABASE_URL!=='undefined' && SUPABASE_URL.indexOf('TU-PROYECTO')<0 &&
                  typeof SUPABASE_ANON_KEY!=='undefined' && SUPABASE_ANON_KEY.indexOf('TU-ANON')<0);
  let sb = null;
  if (hasCfg && window.supabase) {
    try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch(e){ sb=null; }
  }
  const LS = {
    get:(k,fb)=>{try{const s=JSON.parse(localStorage.getItem(k)||'null');return s==null?fb:s}catch(e){return fb}},
    set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  const num = v => (v===''||v==null||isNaN(+v)) ? null : +v;
  // Mapeo: clave local -> tabla + conversor fila<->objeto
  const MAP = {
    pg_socios:{t:'socios', toDb:s=>({id:String(s.id),dni:s.dni||null,nombre:s.nombre,tel:s.tel||'',mail:s.mail||'',plan_id:s.planId||null,inicio:s.inicio||null,vence:s.vence||null,estado:s.estado||'activo',obs:s.obs||''}),
      fromDb:r=>({id:isNaN(+r.id)?r.id:+r.id,dni:r.dni||'',nombre:r.nombre,tel:r.tel||'',mail:r.mail||'',planId:r.plan_id,inicio:r.inicio||'',vence:r.vence||'',estado:r.estado||'activo',obs:r.obs||''}), pk:'id', order:'id'},
    pg_biometria:{t:'biometria', toDb:b=>({socio_id:String(b.socioId),fecha:b.fecha||null,peso:num(b.peso),altura:num(b.altura),grasa:num(b.grasa),peso_objetivo:num(b.pesoObjetivo),updated_at:new Date().toISOString()}),
      fromDb:r=>({socioId:r.socio_id,fecha:r.fecha||'',peso:r.peso==null?'':+r.peso,altura:r.altura==null?'':+r.altura,grasa:r.grasa==null?'':+r.grasa,pesoObjetivo:r.peso_objetivo==null?'':+r.peso_objetivo}), pk:null, conflict:'socio_id,fecha', order:'fecha'},
    pg_planes:{t:'planes', toDb:p=>({id:+p.id,nombre:p.nombre,precio:+p.precio||0,precio_transf:+(p.precioTransf!=null?p.precioTransf:p.precio)||0,dias:+p.dias||30}),
      fromDb:r=>({id:r.id,nombre:r.nombre,precio:+r.precio||0,precioTransf:+r.precio_transf||0,dias:r.dias||30}), pk:'id', order:'id'},
    pg_personal:{t:'personal', toDb:p=>({id:String(p.id),nombre:p.nombre,rol:p.rol||'Profesor',tel:p.tel||'',dni:p.dni||null,mail:p.mail||'',acceso:!!p.acceso,horario:p.horario||{},sueldo:+p.sueldo||0}),
      fromDb:r=>({id:isNaN(+r.id)?r.id:+r.id,nombre:r.nombre,rol:r.rol,tel:r.tel||'',dni:r.dni||'',mail:r.mail||'',acceso:!!r.acceso,horario:r.horario||{},sueldo:+r.sueldo||0}), pk:'id', order:'id'},
    pg_rutinas:{t:'rutinas', toDb:r=>({id:+r.id,nombre:r.nombre,dificultad:r.dificultad||'Principiante',ejercicios:r.ejercicios||[],dias:r.dias||[],archivada:!!r.archivada,fecha:r.fecha||null}),
      fromDb:r=>({id:r.id,nombre:r.nombre,dificultad:r.dificultad||'Principiante',ejercicios:r.ejercicios||[],dias:r.dias||[],archivada:!!r.archivada,fecha:r.fecha||''}), pk:'id', order:'id'},
    pg_mpagos:{t:'mpagos', toDb:m=>({id:+m.id,socio_id:m.socioId!=null?String(m.socioId):null,monto:+m.monto||0,fecha:m.fecha||null,detalle:m.detalle||'',metodo:m.metodo||'Efectivo'}),
      fromDb:r=>({id:r.id,socioId:r.socio_id,monto:+r.monto||0,fecha:r.fecha||'',detalle:r.detalle||'',metodo:r.metodo||'Efectivo'}), pk:'id', order:'id'},
    pg_clases:{t:'clases', toDb:c=>({id:+c.id,nombre:c.nombre,dias:c.dias||[],hora:c.hora||'18:00',horafin:c.horaFin||'',profe:c.profe||'',dur:+c.dur||60,cupo:+c.cupo||20,archivada:!!c.archivada}),
      fromDb:r=>({id:r.id,nombre:r.nombre,dias:r.dias||[],dia:(r.dias||[])[0],hora:r.hora,horafin:r.horafin||'',horaFin:r.horafin||'',profe:r.profe||'',dur:r.dur||60,cupo:r.cupo||20,archivada:!!r.archivada}), pk:'id', order:'id'},
    pg_accesos:{t:'accesos', toDb:a=>({id:+a.id,socio_id:String(a.socioId),fecha:a.fecha||null,hora:a.hora||'',tipo:a.tipo||'entrada',ok:a.ok||'ok',estado:a.estado||''}),
      fromDb:r=>({id:r.id,socioId:isNaN(+r.socio_id)?r.socio_id:+r.socio_id,fecha:r.fecha||'',hora:r.hora||'',tipo:r.tipo,ok:r.ok,estado:r.estado||''}), pk:'id', order:'id'},
    pg_gprods:{t:'gprods', toDb:p=>({id:+p.id,nombre:p.name||p.nombre,cat:p.cat||'Suplementos',precio:+(p.price!=null?p.price:p.precio)||0,stock:+p.stock||0}),
      fromDb:r=>({id:r.id,name:r.nombre,nombre:r.nombre,cat:r.cat,price:+r.precio||0,precio:+r.precio||0,stock:r.stock||0}), pk:'id', order:'id'},
    pg_gventas:{t:'gventas', toDb:v=>({id:+v.id,fecha:v.day||v.fecha||null,hora:v.h||'',detalle:v.det||'',total:+v.total||0,metodo:v.metodo||'Efectivo'}),
      fromDb:r=>({id:r.id,day:r.fecha,fecha:r.fecha,h:r.hora,det:r.detalle,total:+r.total||0,metodo:r.metodo||'Efectivo'}), pk:'id', order:'id'},
    pg_ggastos:{t:'ggastos', toDb:g=>({id:+g.id,fecha:g.fecha||null,descripcion:g.desc||'',monto:+g.monto||0}),
      fromDb:r=>({id:r.id,fecha:r.fecha,desc:r.descripcion||'',monto:+r.monto||0}), pk:'id', order:'id'},
    pg_progreso:{t:'progreso', toDb:x=>({socio_id:String(x.s),fecha:x.f,template_id:+x.t||0,ejercicio:x.e||'',peso:(x.peso===''||x.peso==null)?null:+x.peso,reps:x.reps!=null?String(x.reps):'',done:x.done!==false,motivo:x.motivo||'',updated_at:new Date().toISOString()}),
      fromDb:r=>({s:isNaN(+r.socio_id)?r.socio_id:+r.socio_id,f:r.fecha,t:r.template_id,e:r.ejercicio||'',peso:r.peso==null?'':r.peso,reps:r.reps||'',done:r.done!==false,motivo:r.motivo||'',updatedAt:r.updated_at?Date.parse(r.updated_at):0}), pk:null, conflict:'socio_id,fecha,template_id,ejercicio', order:'fecha'},
    pg_insc:{t:'insc', toDb:i=>({clase_id:+i.c,socio_id:String(i.s),espera:!!i.espera,ts:+i.ts||0}),
      fromDb:r=>({c:r.clase_id,s:isNaN(+r.socio_id)?r.socio_id:+r.socio_id,espera:!!r.espera,ts:+r.ts||0}), pk:null, conflict:'clase_id,socio_id', order:'clase_id'},
    pg_asig:{t:'asig', toDb:a=>({template_id:+a.templateId,socio_id:String(a.socioId),dias:a.dias||[],profe:a.profe||'',fecha:a.fecha||null}),
      fromDb:(r,ix)=>({templateId:r.template_id,socioId:isNaN(+r.socio_id)?r.socio_id:+r.socio_id,dias:r.dias||[],profe:r.profe||'',fecha:r.fecha||''}), pk:null, del:{col:'id',val:-1}, order:'id'},
    pg_clase_exc:{t:'clase_exc', toDb:x=>({clase_id:+x.c,fecha:x.f,cancelada:!!x.cancelada,profe:x.profe||''}),
      fromDb:r=>({c:r.clase_id,f:r.fecha,cancelada:!!r.cancelada,profe:r.profe||''}), pk:null, conflict:'clase_id,fecha', order:'fecha'},
    pg_renovaciones:{t:'renovaciones', toDb:r=>({id:String(r.id),socio_id:r.socioId!=null?String(r.socioId):null,dni:r.dni||'',nombre:r.nombre||'',plan:r.plan||'',vence:r.vence||null,fecha:r.fecha||null,ts:+r.ts||0,estado:r.estado||'pendiente',origen:r.origen||'portal',resuelta_en:r.resueltaEn||null}),
      fromDb:r=>({id:r.id,socioId:r.socio_id,dni:r.dni||'',nombre:r.nombre||'',plan:r.plan||'',vence:r.vence||'',fecha:r.fecha||'',ts:+r.ts||0,estado:r.estado||'pendiente',origen:r.origen||'portal',resueltaEn:r.resuelta_en||''}), pk:'id', order:'ts'},
    pg_eventos:{t:'eventos', toDb:e=>({id:String(e.id),titulo:e.titulo||'',descripcion:e.descripcion||'',fecha:e.fecha||null,hora:e.hora||'',lugar:e.lugar||'',cupo:+e.cupo||0,dirigido_a:e.dirigidoA||'todos',activo:e.activo!==false,creado:e.creado||null}),
      fromDb:r=>({id:r.id,titulo:r.titulo||'',descripcion:r.descripcion||'',fecha:r.fecha||'',hora:r.hora||'',lugar:r.lugar||'',cupo:+r.cupo||0,dirigidoA:r.dirigido_a||'todos',activo:r.activo!==false,creado:r.creado||''}), pk:'id', order:'fecha'},
    pg_invitaciones:{t:'invitaciones', toDb:i=>({id:String(i.id),evento_id:String(i.eventoId),socio_id:String(i.socioId),estado:i.estado||'invitado',fecha:i.fecha||null,actualizado:i.actualizado||null}),
      fromDb:r=>({id:r.id,eventoId:r.evento_id,socioId:r.socio_id,estado:r.estado||'invitado',fecha:r.fecha||'',actualizado:r.actualizado||''}), pk:null, conflict:'evento_id,socio_id', order:'fecha'},
    pg_notif:{t:'notificaciones', toDb:n=>({id:String(n.id),socio_id:String(n.socioId),tipo:n.tipo||'aviso',titulo:n.titulo||'',mensaje:n.mensaje||'',fecha:n.fecha||null,ts:+n.ts||0,ref:n.ref||null,color:n.color||'cyan'}),
      fromDb:r=>({id:r.id,socioId:r.socio_id,tipo:r.tipo||'aviso',titulo:r.titulo||'',mensaje:r.mensaje||'',fecha:r.fecha||'',ts:+r.ts||0,ref:r.ref||'',color:r.color||'cyan'}), pk:'id', order:'ts'}
  };
  const GDB = {
    online: !!sb,
    sb: sb,
    setClient(client){
      if(!client) return;
      sb = client;
      GDB.sb = client;
      GDB.online = true;
    },
    getClient(){ return sb; },
    get auth(){ return sb ? sb.auth : null; },
    fromDb(localKey,row){
      const m=MAP[localKey];
      return m && m.fromDb ? m.fromDb(row) : row;
    },
    toDb(localKey,row){
      const m=MAP[localKey];
      return m && m.toDb ? m.toDb(row) : row;
    },
    // Trae una colección de la nube. Devuelve null si falla (sin fallback local).
    async pullRemote(localKey){
      const m=MAP[localKey]; if(!m||!sb) return null;
      try{
        const order=m.order||m.pk||'id';
        let q=sb.from(m.t).select('*');
        if(order) q=q.order(order,{ascending:false});
        const {data,error}=await q.limit(2000);
        if(error) return null;
        return (data||[]).map((r,ix)=>m.fromDb(r,ix));
      }catch(e){ return null; }
    },
    // Trae una colección (o local si no hay backend)
    async pull(localKey){
      const remote=await GDB.pullRemote(localKey);
      return remote===null ? LS.get(localKey,[]) : remote;
    },
    // Sube una colección completa (upsert por pk o por conflicto; sin clave: borra e inserta)
    async push(localKey, rows){
      LS.set(localKey, rows);
      const m=MAP[localKey]; if(!m||!sb) return true;
      try{
        const payload=(rows||[]).map(m.toDb);
        if(m.conflict){
          for(let i=0;i<payload.length;i+=200){
            const {error}=await sb.from(m.t).upsert(payload.slice(i,i+200),{onConflict:m.conflict});
            if(error) return false;
          }
          return true;
        }
        if(m.pk){
          for(let i=0;i<payload.length;i+=200){
            const {error}=await sb.from(m.t).upsert(payload.slice(i,i+200),{onConflict:m.pk});
            if(error) return false;
          }
          return true;
        }
        await sb.from(m.t).delete().neq(m.del.col,m.del.val);
        for(let i=0;i<payload.length;i+=200){
          const {error}=await sb.from(m.t).insert(payload.slice(i,i+200));
          if(error) return false;
        }
        return true;
      }catch(e){ return false; }
    },
    // Borra filas que coincidan con una columna/valor (para bajas del admin).
    async remove(localKey, column, value){
      const m=MAP[localKey]; if(!m||!sb) return false;
      try{
        const {error}=await sb.from(m.t).delete().eq(column,value);
        return !error;
      }catch(e){ return false; }
    },
    // Reemplaza una colección completa en la nube (borra todo y vuelve a insertar).
    // Pensado para la migración inicial local -> Supabase, con confirmación del admin.
    async replace(localKey, rows){
      LS.set(localKey, rows);
      const m=MAP[localKey]; if(!m||!sb) return true;
      try{
        if(m.del){
          const {error:delErr}=await sb.from(m.t).delete().neq(m.del.col,m.del.val);
          if(delErr) return false;
        }else{
          const col=m.pk||String(m.conflict||'').split(',')[0];
          if(!col) return false;
          const {error:delErr}=await sb.from(m.t).delete().not(col,'is',null);
          if(delErr) return false;
        }
        const payload=(rows||[]).map(m.toDb);
        for(let i=0;i<payload.length;i+=200){
          const {error}=await sb.from(m.t).insert(payload.slice(i,i+200));
          if(error) return false;
        }
        return true;
      }catch(e){ return false; }
    },
    // Configuración pública del portal (nombre y teléfono del gym).
    async pushConfig(cfg){
      if(!sb) return false;
      try{
        const row={
          id:1,
          gym_nombre:String((cfg&&cfg.gymNombre)||'Mi Gym').slice(0,80),
          gym_tel:String((cfg&&cfg.gymTel)||'').slice(0,40),
          updated_at:new Date().toISOString()
        };
        const {error}=await sb.from('portal_config').upsert(row,{onConflict:'id'});
        return !error;
      }catch(e){ return false; }
    },
    async pullConfig(){
      if(!sb) return null;
      try{
        const {data,error}=await sb.from('portal_config').select('*').eq('id',1).maybeSingle();
        return error?null:data;
      }catch(e){ return null; }
    },
    // Devuelve la fila de portal_staff del usuario autenticado (o null).
    async getStaff(){
      if(!sb) return null;
      try{
        const {data:{session}}=await sb.auth.getSession();
        if(!session||!session.user) return null;
        const email=String(session.user.email||'').toLowerCase().trim();
        if(!email) return null;
        const {data,error}=await sb.from('portal_staff').select('*').ilike('email',email).maybeSingle();
        return (!error&&data)?data:null;
      }catch(e){ return null; }
    },
    // Verifica que el usuario autenticado esté en portal_staff.
    async checkStaff(){
      return !!(await GDB.getStaff());
    }
  };
  window.GDB=GDB;
})();
