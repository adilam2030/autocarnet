import 'react-native-gesture-handler';
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, TextInput, Switch,
  FlatList, Modal, ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';



const C = {
  primary:'#1a56db',primaryDark:'#0e3a8a',primaryLight:'#eff6ff',
  success:'#10b981',successLight:'#d1fae5',
  warning:'#f59e0b',warningLight:'#fef3c7',
  danger:'#ef4444',dangerLight:'#fee2e2',
  text:'#111827',textMed:'#374151',textLight:'#6b7280',
  border:'#e5e7eb',bg:'#f8fafc',white:'#ffffff',
};

const MARQUES_MODELES = {
  'Audi':['A1','A3','A4','A5','A6','Q2','Q3','Q5','Q7','Q8','TT','e-tron','Autre'],
  'BMW':['Série 1','Série 2','Série 3','Série 4','Série 5','X1','X3','X5','X6','i3','i4','Autre'],
  'Citroën':['C1','C2','C3','C4','C5','C-Elysée','Berlingo','C3 Aircross','C5 Aircross','Autre'],
  'Dacia':['Logan','Sandero','Duster','Lodgy','Dokker','Spring','Jogger','Bigster','Autre'],
  'Fiat':['500','Punto','Tipo','Panda','Bravo','Doblo','Autre'],
  'Ford':['Fiesta','Focus','Mondeo','Kuga','Puma','Mustang','Ranger','Transit','Autre'],
  'Honda':['Civic','Jazz','CR-V','HR-V','Accord','City','Autre'],
  'Hyundai':['i10','i20','i30','Tucson','Santa Fe','Kona','Ioniq','Elantra','Autre'],
  'Kia':['Picanto','Rio','Ceed','Sportage','Sorento','Stonic','Niro','EV6','Autre'],
  'Land Rover':['Defender','Discovery','Range Rover','Range Rover Sport','Evoque','Autre'],
  'Mazda':['2','3','6','CX-3','CX-5','CX-30','MX-5','Autre'],
  'Mercedes':['Classe A','Classe B','Classe C','Classe E','Classe S','GLA','GLC','GLE','GLS','CLA','EQC','Autre'],
  'Mitsubishi':['Colt','Lancer','Eclipse Cross','Outlander','ASX','L200','Autre'],
  'Nissan':['Micra','Note','Juke','Qashqai','X-Trail','Leaf','Navara','Patrol','Autre'],
  'Opel':['Corsa','Astra','Insignia','Mokka','Crossland','Grandland','Zafira','Autre'],
  'Peugeot':['107','108','206','207','208','301','308','408','508','2008','3008','5008','Partner','Autre'],
  'Renault':['Clio','Megane','Symbol','Sandero','Duster','Kadjar','Captur','Koleos','Talisman','Kangoo','Zoe','Arkana','Autre'],
  'Seat':['Ibiza','Leon','Toledo','Arona','Ateca','Tarraco','Autre'],
  'Skoda':['Fabia','Octavia','Superb','Karoq','Kodiaq','Kamiq','Autre'],
  'Suzuki':['Alto','Swift','Baleno','Vitara','SX4','Jimny','Ignis','Autre'],
  'Toyota':['Yaris','Corolla','Camry','Auris','CHR','RAV4','Hilux','Land Cruiser','Prius','Autre'],
  'Volkswagen':['Polo','Golf','Passat','T-Cross','T-Roc','Tiguan','Touareg','Touran','ID.3','ID.4','Transporter','Autre'],
  'Volvo':['S60','S90','V60','V90','XC40','XC60','XC90','Autre'],
  'Autre':['Autre modèle'],
};
const MARQUES=[...Object.keys(MARQUES_MODELES).filter(m=>m!=='Autre').sort(),'Autre'];
const LETTRES_IMMAT='ABCDEFGHIJKLMNOPQRSTUVW'.split('');
const REGIONS_IMMAT=Array.from({length:99},(_,i)=>String(i+1).padStart(2,'0'));
const CARBURANTS=['Essence','Diesel','Hybride','Électrique'];
const OP_TYPES=['Vidange complète (huile + filtres)','Vidange simple (huile seule)','Courroie de distribution','Batterie','Pneus','Freins','Climatisation','Amortisseurs','Bougies','Boîte automatique','AdBlue','Liquide de frein','Liquide refroidissement','Visite technique','Assurance','Vignette','Autre'];
const COULEURS_CAR=['#1a56db','#0e9f6e','#ef4444','#f59e0b','#8b5cf6','#ec4899','#374151','#0891b2','#ffffff'];
const ASSURANCES_MA=['Wafa Assurance','RMA Watanya','Saham Assurance','Atlanta Assurance','AXA Assurance Maroc','MAMDA','MCMA','Allianz Maroc','Zurich Assurance','Autre'];
const GARAGES=['Concessionnaire','Mécanicien','FastPro','Midas','Speedy','Station de service','Autre'];
const FREQUENCES_KM=['5000','7500','10000','15000','20000'];
const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const PERIODES=['Mois en cours','3 derniers mois','Année en cours','Tout'];
const CHECKLIST_VOYAGE=[
  {id:'pneus',label:'Pression des pneus vérifiée',icon:'🛞'},
  {id:'roue',label:'Roue de secours présente',icon:'🔧'},
  {id:'niveaux',label:'Niveaux vérifiés (huile, eau, freins)',icon:'🧪'},
  {id:'assurance',label:'Assurance à jour',icon:'🛡️'},
  {id:'vignette',label:'Vignette payée',icon:'🏷️'},
  {id:'eclairage',label:'Éclairage fonctionnel',icon:'💡'},
  {id:'batterie',label:'Batterie vérifiée',icon:'🔋'},
  {id:'documents',label:'Documents de bord présents',icon:'📄'},
];

const fmtKm=n=>n?`${Number(n).toLocaleString('fr-FR')} km`:'—';
const fmtMoney=n=>n?`${Number(n).toLocaleString('fr-FR')} DH`:'—';
const fmtDate=d=>{if(!d)return'—';try{const p=d.split('-');return`${p[2]}/${p[1]}/${p[0]}`;}catch{return d;}};
const fmtImmat=i=>{if(!i)return'—';const p=i.split('|');return p.length===3?`${p[0]} · ${p[1]} · ${p[2]}`:i;};
const today=()=>new Date().toISOString().split('T')[0];
const carAge=d=>d?(new Date()-new Date(d))/(365.25*24*3600*1000):0;
const nextRevKm=car=>(car.revision?.dernierKm||0)+(car.revision?.frequence||10000);
const revStatus=car=>{const d=nextRevKm(car)-(car.km||0);return d<=0?'urgent':d<=1000?'warning':'ok';};
const assStatus=car=>{
  if(!car.assurance?.echeance)return'na';
  const d=Math.round((new Date(car.assurance.echeance)-new Date())/86400000);
  if(d<0)return'urgent';
  if(d<=30)return'warning';
  return'ok';
};
const vtStatus=car=>{if(carAge(car.dateMEC)<5)return'na';if(!car.vt?.echeance)return'urgent';const d=Math.round((new Date(car.vt.echeance)-new Date())/86400000);return d<0?'urgent':d<=30?'warning':'ok';};
const globalStatus=car=>{const s=[revStatus(car),assStatus(car),vtStatus(car)];if(!car.vignette?.payee)s.push('warning');return s.includes('urgent')?'urgent':s.includes('warning')?'warning':'ok';};
const SC={ok:C.success,warning:C.warning,urgent:C.danger,na:'#9ca3af'};
const SB={ok:C.successLight,warning:C.warningLight,urgent:C.dangerLight,na:'#f3f4f6'};
const SL={ok:'À jour',warning:'Bientôt',urgent:'Urgent',na:'N/A'};

// ─── AUTH LOCAL (mode test sans Google) ──────────────────────────────────────
const BACKUP_FILENAME = 'autocarnet_backup.json';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

// ─── TOKEN MANAGEMENT ─────────────────────────────────────────────────────────
const getAccessToken = async () => { return null; };

const gSignIn = async () => {
  const user = { uid: 'local', name: 'Utilisateur', email: 'local@autocarnet.app', photo: '' };
  await AsyncStorage.setItem('g_user', JSON.stringify(user));
  await AsyncStorage.setItem('userName', user.name);
  await AsyncStorage.setItem('drive_scope_granted', 'false');
  return { success: true, user };
};

const gSignOut = async () => {
  await AsyncStorage.multiRemove(['g_user','last_sync','drive_file_id','userName','cars','operations','drive_scope_granted']);
};

const gRestoreSession = async () => {
  const user = await AsyncStorage.getItem('g_user');
  return !!user;
};

const gHasDriveScope = async () => {
  const g = await AsyncStorage.getItem('drive_scope_granted');
  return g === 'true';
};

// ─── GOOGLE DRIVE ─────────────────────────────────────────────────────────────
const driveGetFileId = async (token, forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem('drive_file_id');
      if (cached) return cached;
    } else {
      await AsyncStorage.removeItem('drive_file_id');
    }
    const r = await fetch(
      `${DRIVE_FILES_URL}?spaces=appDataFolder&q=name%3D%27${BACKUP_FILENAME}%27&fields=files(id%2CmodifiedTime)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const d = await r.json();
    if (d.files && d.files.length > 0) {
      await AsyncStorage.setItem('drive_file_id', d.files[0].id);
      return d.files[0].id;
    }
    return null;
  } catch (e) { return null; }
};

const driveReadBackup = async (token) => {
  try {
    const fileId = await driveGetFileId(token);
    if (!fileId) return null;
    const r = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      if (r.status === 404) await AsyncStorage.removeItem('drive_file_id');
      return null;
    }
    return await r.json();
  } catch { return null; }
};

const driveWriteBackup = async (token, data) => {
  try {
    const content = JSON.stringify({ ...data, lastUpdated: new Date().toISOString(), version: '1.0' });
    let fileId = await driveGetFileId(token, true);
    if (!fileId) {
      const boundary = 'autocarnet_bnd';
      const multipart = [
        '--' + boundary,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify({ name: BACKUP_FILENAME, parents: ['appDataFolder'] }),
        '--' + boundary,
        'Content-Type: application/json',
        '',
        content,
        '--' + boundary + '--',
      ].join('\r\n');
      const cr = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: multipart,
      });
      const cd = await cr.json();
      if (cd.id) { await AsyncStorage.setItem('drive_file_id', cd.id); return true; }
      return false;
    }
    const r = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: content,
    });
    if (r.status === 404) { await AsyncStorage.removeItem('drive_file_id'); return await driveWriteBackup(token, data); }
    return r.ok;
  } catch { return false; }
};

// ─── DEBOUNCE SYNC ────────────────────────────────────────────────────────────
let syncTimer = null;
let lastSyncTime = 0;
const scheduleDriveSync = (data) => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const now = Date.now();
    if (now - lastSyncTime < 30000) return;
    lastSyncTime = now;
    const token = await getAccessToken();
    if (token) { await driveWriteBackup(token, data); await AsyncStorage.setItem('last_sync', String(now)); }
  }, 10000);
};

const Ctx=createContext(null);
const AppProvider=({children})=>{
  const[cars,setCars]=useState([]);
  const[operations,setOperations]=useState({});
  const[syncStatus,setSyncStatus]=useState('local');
  useEffect(()=>{loadLocal();},[]);
  const loadLocal=async()=>{
    const lc=await AsyncStorage.getItem('cars');
    const lo=await AsyncStorage.getItem('operations');
    if(lc)setCars(JSON.parse(lc));
    if(lo)setOperations(JSON.parse(lo));
  };
  const syncFromCloud=async()=>{
    setSyncStatus('syncing');
    try{
      const token=await getAccessToken();
      if(!token){setSyncStatus('offline');return;}
      const backup=await driveReadBackup(token);
      if(!backup){
        const lc=await AsyncStorage.getItem('cars');
        const lo=await AsyncStorage.getItem('operations');
        await driveWriteBackup(token,{cars:lc?JSON.parse(lc):[],operations:lo?JSON.parse(lo):{}});
        setSyncStatus('synced');return;
      }
      const localSync=await AsyncStorage.getItem('last_sync');
      const localTime=localSync?Number(localSync):0;
      const driveTime=backup.lastUpdated?new Date(backup.lastUpdated).getTime():0;
      if(driveTime>localTime+5000){return {conflict:true,driveData:backup,driveTime,localTime};}
      setSyncStatus('synced');return {conflict:false};
    }catch(e){setSyncStatus('error');return {error:true};}
  };
  const restoreFromDrive=async(backup)=>{
    if(backup.cars){setCars(backup.cars);await AsyncStorage.setItem('cars',JSON.stringify(backup.cars));}
    if(backup.operations){setOperations(backup.operations);await AsyncStorage.setItem('operations',JSON.stringify(backup.operations));}
    const now=Date.now();await AsyncStorage.setItem('last_sync',String(now));setSyncStatus('synced');
  };
  const pushToCloud=async(carsData,opsData)=>{
    setSyncStatus('syncing');
    scheduleDriveSync({cars:carsData,operations:opsData});
    setSyncStatus('synced');
  };
  const saveLocal=async(newCars,newOps)=>{
    if(newCars!==undefined){setCars(newCars);await AsyncStorage.setItem('cars',JSON.stringify(newCars));}
    if(newOps!==undefined){setOperations(newOps);await AsyncStorage.setItem('operations',JSON.stringify(newOps));}
    const c=newCars!==undefined?newCars:cars;
    const o=newOps!==undefined?newOps:operations;
    pushToCloud(c,o);
  };
  const addCar=async car=>{const nc=[...cars,{...car,id:Date.now().toString()}];await saveLocal(nc,undefined);};
  const updateCar=async(id,data)=>{const nc=cars.map(c=>c.id===id?{...c,...data}:c);await saveLocal(nc,undefined);};
  const deleteCar=async id=>{const nc=cars.filter(c=>c.id!==id);const no={...operations};delete no[id];await saveLocal(nc,no);};
  const addOperation=async(carId,op)=>{
    const co=operations[carId]||[];
    const newOp={...op,id:Date.now().toString(),carId};
    const no={...operations,[carId]:[newOp,...co]};
    await saveLocal(undefined,no);
  };
  const updateOperation=async(carId,opId,data)=>{
    const co=(operations[carId]||[]).map(o=>o.id===opId?{...o,...data}:o);
    const no={...operations,[carId]:co};
    await saveLocal(undefined,no);
  };
  return <Ctx.Provider value={{cars,operations,syncStatus,addCar,updateCar,deleteCar,addOperation,updateOperation,syncFromCloud,restoreFromDrive,setSyncStatus}}>{children}</Ctx.Provider>;
};
const useApp=()=>useContext(Ctx);

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────
const Dropdown=({label,value,options,onSelect,placeholder,required})=>{
  const[show,setShow]=useState(false);
  return(
    <View style={{marginBottom:16}}>
      {label&&<Text style={{fontSize:13,fontWeight:'600',color:C.textMed,marginBottom:6}}>{label}{required&&<Text style={{color:C.danger}}> *</Text>}</Text>}
      <TouchableOpacity onPress={()=>setShow(true)} style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:value?C.primary:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontSize:14,color:value?C.text:'#9ca3af',fontWeight:value?'600':'400'}}>{value||placeholder||'Sélectionner...'}</Text>
        <Text style={{fontSize:12,color:C.textLight}}>▼</Text>
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="slide" onRequestClose={()=>setShow(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} activeOpacity={1} onPress={()=>setShow(false)}/>
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'75%'}}>
          <View style={{alignItems:'center',paddingVertical:12}}>
            <View style={{width:40,height:4,backgroundColor:C.border,borderRadius:2}}/>
            <Text style={{fontSize:16,fontWeight:'700',color:C.text,marginTop:10}}>{label||'Choisir'}</Text>
          </View>
          <FlatList data={options} keyExtractor={i=>String(i)} contentContainerStyle={{paddingHorizontal:16,paddingBottom:40}}
            renderItem={({item})=>(
              <TouchableOpacity onPress={()=>{onSelect(item);setShow(false);}} style={{paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#f3f4f6',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <Text style={{fontSize:15,color:item===value?C.primary:C.text,fontWeight:item===value?'700':'400'}}>{item}</Text>
                {item===value&&<Text style={{color:C.primary,fontSize:18}}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

// ─── DATE PICKER ──────────────────────────────────────────────────────────────
const ScrollPicker=({items,selected,onSelect,itemHeight=44})=>{
  const idx=items.indexOf(String(selected));
  const ref=React.useRef(null);
  useEffect(()=>{
    if(ref.current&&idx>=0){setTimeout(()=>ref.current?.scrollTo({y:idx*itemHeight,animated:false}),100);}
  },[]);
  return(
    <View style={{height:itemHeight*5,overflow:'hidden',position:'relative'}}>
      <View style={{position:'absolute',top:itemHeight*2,left:0,right:0,height:itemHeight,backgroundColor:C.primaryLight,borderRadius:8,zIndex:0}}/>
      <ScrollView ref={ref} showsVerticalScrollIndicator={false} snapToInterval={itemHeight} decelerationRate="fast"
        onMomentumScrollEnd={e=>{const i=Math.round(e.nativeEvent.contentOffset.y/itemHeight);if(i>=0&&i<items.length)onSelect(items[Math.min(i,items.length-1)]);}}
        contentContainerStyle={{paddingVertical:itemHeight*2}}>
        {items.map((item,i)=>(
          <TouchableOpacity key={item} onPress={()=>{ref.current?.scrollTo({y:i*itemHeight,animated:true});onSelect(item);}} style={{height:itemHeight,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:String(item)===String(selected)?18:14,fontWeight:String(item)===String(selected)?'800':'400',color:String(item)===String(selected)?C.primary:C.textLight}}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const DatePicker=({label,value,onChange,required,future=false})=>{
  const[show,setShow]=useState(false);
  const[year,setYear]=useState(value?parseInt(value.split('-')[0]):new Date().getFullYear());
  const[month,setMonth]=useState(value?parseInt(value.split('-')[1]):new Date().getMonth()+1);
  const[day,setDay]=useState(value?parseInt(value.split('-')[2]):new Date().getDate());
  const CY=new Date().getFullYear();
  const YEARS=future?Array.from({length:16},(_,i)=>String(CY+i)):Array.from({length:CY-1989},(_,i)=>String(CY-i));
  const daysInMonth=new Date(year,month,0).getDate();
  const DAYS=Array.from({length:daysInMonth},(_,i)=>String(i+1).padStart(2,'0'));
  const MOIS_SHORT=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const open=()=>{if(value){const p=value.split('-');setYear(parseInt(p[0]));setMonth(parseInt(p[1]));setDay(parseInt(p[2]));}setShow(true);};
  const confirm=()=>{onChange(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);setShow(false);};
  return(
    <View style={{marginBottom:16}}>
      {label&&<Text style={{fontSize:13,fontWeight:'600',color:C.textMed,marginBottom:6}}>{label}{required&&<Text style={{color:C.danger}}> *</Text>}</Text>}
      <TouchableOpacity onPress={open} style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:value?C.primary:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontSize:14,color:value?C.text:'#9ca3af',fontWeight:value?'600':'400'}}>{value?fmtDate(value):'Sélectionner une date'}</Text>
        <Text style={{fontSize:18}}>📅</Text>
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="slide" onRequestClose={()=>setShow(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} activeOpacity={1} onPress={()=>setShow(false)}/>
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,padding:24}}>
          <View style={{alignItems:'center',marginBottom:16}}>
            <View style={{width:40,height:4,backgroundColor:C.border,borderRadius:2,marginBottom:12}}/>
            <Text style={{fontSize:16,fontWeight:'700',color:C.text}}>{label||'Date'}</Text>
          </View>
          <View style={{backgroundColor:C.primaryLight,borderRadius:14,padding:14,alignItems:'center',marginBottom:16}}>
            <Text style={{fontSize:24,fontWeight:'800',color:C.primary}}>{String(day).padStart(2,'0')} / {String(month).padStart(2,'0')} / {year}</Text>
          </View>
          <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
            <View style={{flex:1,alignItems:'center'}}>
              <Text style={{fontSize:11,fontWeight:'600',color:C.textLight,marginBottom:4}}>JOUR</Text>
              <ScrollPicker items={DAYS} selected={String(day).padStart(2,'0')} onSelect={v=>setDay(parseInt(v))}/>
            </View>
            <View style={{flex:2,alignItems:'center'}}>
              <Text style={{fontSize:11,fontWeight:'600',color:C.textLight,marginBottom:4}}>MOIS</Text>
              <ScrollPicker items={MOIS_SHORT} selected={MOIS_SHORT[month-1]} onSelect={v=>setMonth(MOIS_SHORT.indexOf(v)+1)}/>
            </View>
            <View style={{flex:1.5,alignItems:'center'}}>
              <Text style={{fontSize:11,fontWeight:'600',color:C.textLight,marginBottom:4}}>ANNÉE</Text>
              <ScrollPicker items={YEARS} selected={String(year)} onSelect={v=>setYear(parseInt(v))}/>
            </View>
          </View>
          <TouchableOpacity onPress={confirm} style={{backgroundColor:C.primary,borderRadius:14,padding:16,alignItems:'center'}}>
            <Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>✓ Confirmer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// ─── IMMATRICULATION ──────────────────────────────────────────────────────────
const ImmatInput=({value,onChange})=>{
  const parts=value?value.split('|'):['','',''];
  const[num,setNum]=useState(parts[0]||'');
  const[lettre,setLettre]=useState(parts[1]||'');
  const[region,setRegion]=useState(parts[2]||'');
  const[showL,setShowL]=useState(false);
  const[showR,setShowR]=useState(false);
  const update=(n,l,r)=>{setNum(n);setLettre(l);setRegion(r);if(n&&l&&r)onChange(`${n}|${l}|${r}`);};
  return(
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:13,fontWeight:'600',color:C.textMed,marginBottom:6}}>Immatriculation <Text style={{color:C.danger}}>*</Text></Text>
      <Text style={{fontSize:11,color:C.textLight,marginBottom:10}}>Format Maroc : Numéro · Lettre · Région</Text>
      <View style={{flexDirection:'row',alignItems:'flex-start',gap:8}}>
        <View style={{flex:3}}>
          <TextInput value={num} onChangeText={v=>{const n=v.replace(/\D/g,'').slice(0,5);update(n,lettre,region);}}
            placeholder="12345" keyboardType="number-pad" maxLength={5}
            style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:num?C.primary:C.border,borderRadius:12,paddingHorizontal:10,paddingVertical:14,fontSize:18,fontWeight:'700',color:C.text,textAlign:'center'}}
            placeholderTextColor="#9ca3af"/>
          <Text style={{fontSize:10,color:C.textLight,textAlign:'center',marginTop:4}}>Numéro</Text>
        </View>
        <Text style={{fontSize:24,color:C.textLight,paddingTop:12}}>·</Text>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={()=>setShowL(true)} style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:lettre?C.primary:C.border,borderRadius:12,paddingVertical:14,alignItems:'center'}}>
            <Text style={{fontSize:20,fontWeight:'800',color:lettre?C.primary:'#9ca3af'}}>{lettre||'?'}</Text>
          </TouchableOpacity>
          <Text style={{fontSize:10,color:C.textLight,textAlign:'center',marginTop:4}}>Lettre</Text>
        </View>
        <Text style={{fontSize:24,color:C.textLight,paddingTop:12}}>·</Text>
        <View style={{flex:2}}>
          <TextInput value={region} onChangeText={v=>{const r=v.replace(/\D/g,'').slice(0,2);update(num,lettre,r);}}
            placeholder="01" keyboardType="number-pad" maxLength={2}
            style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:region?C.primary:C.border,borderRadius:12,paddingHorizontal:6,paddingVertical:14,fontSize:18,fontWeight:'800',color:C.primary,textAlign:'center'}}
            placeholderTextColor="#9ca3af"/>
          <Text style={{fontSize:10,color:C.textLight,textAlign:'center',marginTop:4}}>Région</Text>
        </View>
      </View>
      {num&&lettre&&region&&(
        <View style={{backgroundColor:C.primaryLight,borderRadius:10,padding:10,marginTop:10,alignItems:'center'}}>
          <Text style={{fontSize:18,fontWeight:'800',color:C.primary,letterSpacing:3}}>{num} · {lettre} · {region}</Text>
        </View>
      )}
      <Modal visible={showL} transparent animationType="slide" onRequestClose={()=>setShowL(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} activeOpacity={1} onPress={()=>setShowL(false)}/>
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'60%',padding:20}}>
          <View style={{alignItems:'center',marginBottom:16}}><View style={{width:40,height:4,backgroundColor:C.border,borderRadius:2,marginBottom:10}}/><Text style={{fontSize:16,fontWeight:'700'}}>Choisir la lettre</Text></View>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
            {LETTRES_IMMAT.map(l=>(
              <TouchableOpacity key={l} onPress={()=>{update(num,l,region);setShowL(false);}} style={{width:50,height:50,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:l===lettre?C.primary:C.primaryLight}}>
                <Text style={{fontSize:20,fontWeight:'800',color:l===lettre?'#fff':C.primary}}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{height:20}}/>
        </View>
      </Modal>
    </View>
  );
};

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const Card=({children,style,onPress})=>{const s=[{backgroundColor:C.white,borderRadius:16,padding:16,marginBottom:12,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.07,shadowRadius:8,elevation:3},style];return onPress?<TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s}>{children}</TouchableOpacity>:<View style={s}>{children}</View>;};
const Badge=({status,label})=><View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:4,borderRadius:20,backgroundColor:SB[status]||SB.na}}><View style={{width:7,height:7,borderRadius:4,backgroundColor:SC[status]||SC.na}}/><Text style={{fontSize:12,fontWeight:'700',color:SC[status]||SC.na}}>{label||SL[status]||'N/A'}</Text></View>;
const InfoRow=({label,value,last})=><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:last?0:1,borderBottomColor:'#f3f4f6'}}><Text style={{fontSize:13,color:C.textLight}}>{label}</Text><Text style={{fontSize:13,fontWeight:'600',color:C.text,maxWidth:'60%',textAlign:'right'}}>{value||'—'}</Text></View>;
const Btn=({label,onPress,variant='primary',loading,style})=>{const bg=variant==='primary'?C.primary:variant==='danger'?C.danger:'transparent';const color=variant==='outline'?C.primary:'#fff';return<TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={loading} style={[{backgroundColor:bg,borderRadius:12,paddingVertical:14,paddingHorizontal:20,alignItems:'center',justifyContent:'center',borderWidth:variant==='outline'?2:0,borderColor:C.primary},style]}>{loading?<ActivityIndicator color={color}/>:<Text style={{fontSize:15,fontWeight:'700',color}}>{label}</Text>}</TouchableOpacity>;};
const Input=({label,required,...props})=><View style={{marginBottom:16}}>{label&&<Text style={{fontSize:13,fontWeight:'600',color:C.textMed,marginBottom:6}}>{label}{required&&<Text style={{color:C.danger}}> *</Text>}</Text>}<TextInput style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:12,fontSize:14,color:C.text}} placeholderTextColor="#9ca3af" {...props}/></View>;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginScreen=({navigation})=>{
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  useEffect(()=>{gRestoreSession().then(ok=>{if(ok)navigation.replace('Main');});},[]);
  const handleGoogleSignIn=async()=>{
    setLoading(true);setError('');
    const r=await gSignIn();
    if(r.success){
      navigation.replace('Main');
    } else if(r.cancelled){
      setLoading(false);
    } else {
      setLoading(false);
      setError(r.error||'Erreur de connexion Google');
    }
  };
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.primary}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flex:1,justifyContent:'center',padding:24}}>
        <View style={{alignItems:'center',marginBottom:40}}>
          <View style={{width:88,height:88,borderRadius:24,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <Text style={{fontSize:44}}>🚗</Text>
          </View>
          <Text style={{fontSize:32,fontWeight:'800',color:'#fff',letterSpacing:-1}}>AutoCarnet</Text>
          <Text style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginTop:4}}>Votre carnet d'entretien intelligent</Text>
        </View>
        <View style={{backgroundColor:'#fff',borderRadius:24,padding:28}}>
          <Text style={{fontSize:22,fontWeight:'800',color:C.text,marginBottom:6}}>Bienvenue</Text>
          <Text style={{fontSize:13,color:C.textLight,marginBottom:24,lineHeight:20}}>
            Connectez-vous avec votre compte Google.{'\n'}Vos données sont sauvegardées dans votre Drive.
          </Text>
          {error?<View style={{backgroundColor:C.dangerLight,borderRadius:10,padding:10,marginBottom:14}}>
            <Text style={{color:C.danger,fontSize:13,fontWeight:'600'}}>{error}</Text>
          </View>:null}
          <TouchableOpacity onPress={handleGoogleSignIn} disabled={loading}
            style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,padding:16,borderRadius:14,borderWidth:2,borderColor:'#e5e7eb',backgroundColor:'#fff',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2}}>
            {loading?<ActivityIndicator color={C.primary}/>:<>
              <View style={{width:28,height:28,borderRadius:14,backgroundColor:'#4285F4',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:16,fontWeight:'900',color:'#fff'}}>G</Text>
              </View>
              <Text style={{fontSize:15,fontWeight:'700',color:C.textMed}}>Continuer avec Google</Text>
            </>}
          </TouchableOpacity>
          <Text style={{fontSize:11,color:'#9ca3af',textAlign:'center',marginTop:16,lineHeight:16}}>
            🔒 Données privées dans votre Google Drive{'\n'}Récupérables sur tout appareil
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const DashboardScreen=({navigation})=>{
  const{cars,syncStatus}=useApp();
  const[userName,setUserName]=useState('');
  useEffect(()=>{AsyncStorage.getItem('userName').then(n=>setUserName(n||''));},[]);
  const urgent=cars.filter(c=>globalStatus(c)==='urgent').length;
  const warning=cars.filter(c=>globalStatus(c)==='warning').length;
  const syncCfg={synced:{color:C.success,label:'Synchronisé ☁️'},syncing:{color:C.warning,label:'Sync...'},error:{color:C.danger,label:'Hors ligne'},local:{color:'#9ca3af',label:'Local'}};
  const sc=syncCfg[syncStatus]||syncCfg.local;
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark}/>
      <View style={{backgroundColor:C.primary,padding:20,paddingBottom:32}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <View>
            <Text style={{color:'rgba(255,255,255,0.7)',fontSize:13}}>Bonjour,</Text>
            <Text style={{color:'#fff',fontSize:22,fontWeight:'800'}}>{userName} 👋</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:sc.color}}/>
            <Text style={{color:'rgba(255,255,255,0.8)',fontSize:11}}>{sc.label}</Text>
          </View>
        </View>
        {(urgent>0||warning>0)&&(
          <TouchableOpacity onPress={()=>navigation.navigate('Notifications')} style={{backgroundColor:'rgba(255,255,255,0.15)',borderRadius:14,padding:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{color:'#fff',fontSize:13,fontWeight:'600',flex:1}}>{urgent>0&&`🔴 ${urgent} alerte${urgent>1?'s':''} urgente${urgent>1?'s':''}  `}{warning>0&&`🟡 ${warning} échéance${warning>1?'s':''} proche${warning>1?'s':''}`}</Text>
            <Text style={{color:'#fff',fontSize:20}}>›</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList data={cars} keyExtractor={c=>c.id} contentContainerStyle={{padding:16,paddingTop:20,paddingBottom:100}}
        ListHeaderComponent={
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <Text style={{fontSize:17,fontWeight:'700',color:C.text}}>Mes véhicules ({cars.length})</Text>
            <TouchableOpacity onPress={()=>navigation.navigate('AddCar')} style={{backgroundColor:C.primary,borderRadius:12,paddingHorizontal:16,paddingVertical:8}}>
              <Text style={{color:'#fff',fontWeight:'700',fontSize:13}}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <Card style={{alignItems:'center',padding:40}}>
            <Text style={{fontSize:48,marginBottom:12}}>🚗</Text>
            <Text style={{fontSize:16,fontWeight:'700',color:C.text}}>Aucun véhicule</Text>
            <Text style={{fontSize:13,color:C.textLight,marginTop:6,textAlign:'center'}}>Ajoutez votre premier véhicule pour commencer</Text>
          </Card>
        }
        renderItem={({item:car})=>{
          const gs=globalStatus(car);const rs=revStatus(car);const as=assStatus(car);
          return(
            <Card onPress={()=>navigation.navigate('CarDetail',{carId:car.id})}>
              <View style={{flexDirection:'row',gap:14}}>
                <View style={{width:52,height:52,borderRadius:14,backgroundColor:(car.color||C.primary)+'20',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Text style={{fontSize:26}}>🚗</Text>
                </View>
                <View style={{flex:1}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <Text style={{fontSize:16,fontWeight:'700',color:C.text,flex:1}}>{car.marque} {car.modele}</Text>
                    <View style={{width:10,height:10,borderRadius:5,backgroundColor:SC[gs],marginTop:4}}/>
                  </View>
                  <Text style={{fontSize:12,color:C.textLight,marginTop:2}}>{fmtImmat(car.immat)} · {car.carburant}</Text>
                </View>
              </View>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:10}}>
                <View style={{backgroundColor:'#f3f4f6',paddingHorizontal:10,paddingVertical:4,borderRadius:20}}>
                  <Text style={{fontSize:12,fontWeight:'700',color:C.textMed}}>{fmtKm(car.km)}</Text>
                </View>
                <Badge status={rs} label={`Rév. ${fmtKm(nextRevKm(car))}`}/>
                <Badge status={as} label={`Ass. ${fmtDate(car.assurance?.echeance)}`}/>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

// ─── DÉTAIL VOITURE ───────────────────────────────────────────────────────────
const CarDetailScreen=({route,navigation})=>{
  const{carId}=route.params;
  const{cars,operations,updateCar,deleteCar}=useApp();
  const car=cars.find(c=>c.id===carId);
  const ops=operations[carId]||[];
  const[tab,setTab]=useState('entretien');
  const[editModal,setEditModal]=useState(null);
  const[editForm,setEditForm]=useState({});
  const[kmModal,setKmModal]=useState(false);
  const[newKm,setNewKm]=useState('');
  const[kmError,setKmError]=useState('');
  const[periode,setPeriode]=useState('Tout');
  const[showDepDetail,setShowDepDetail]=useState(false);
  const[checklistModal,setChecklistModal]=useState(false);
  const[checklist,setChecklist]=useState({});
  if(!car)return null;
  const rs=revStatus(car);const as=assStatus(car);const vs=vtStatus(car);
  const vtApp=carAge(car.dateMEC)>=5;

  const filterByPeriode=(items)=>{
    if(periode==='Tout')return items;
    const now=new Date();
    return items.filter(o=>{
      const d=new Date(o.date);
      if(periode==='Mois en cours')return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();
      if(periode==='3 derniers mois')return d>=new Date(now.getFullYear(),now.getMonth()-3,now.getDate());
      if(periode==='Année en cours')return d.getFullYear()===now.getFullYear();
      return true;
    });
  };
  const revisionInitiale=car.revision?.dernierKm&&car.revision?.derniereDate?[{id:"rev_init",type:car.revision.type||"Vidange complète (huile + filtres)",date:car.revision.derniereDate,km:car.revision.dernierKm,garage:car.revision.garage||"",montant:Number(car.revision.montant)||0,note:car.revision.note||"Révision initiale"}]:[];
  const allOps=[...ops,...revisionInitiale.filter(r=>!ops.some(o=>o.date===r.date&&o.km===r.km))];
  const filteredOps=filterByPeriode([...allOps].sort((a,b)=>new Date(b.date)-new Date(a.date)));
  const totalDep=filteredOps.reduce((s,o)=>s+(Number(o.montant)||0),0);

  const openEdit=(section)=>{
    if(section==='assurance')setEditForm({...car.assurance});
    if(section==='vignette')setEditForm({...car.vignette});
    if(section==='vt')setEditForm({...car.vt||{}});
    setEditModal(section);
  };
  const saveEdit=()=>{
    if(editModal==='assurance')updateCar(carId,{assurance:editForm});
    if(editModal==='vignette')updateCar(carId,{vignette:editForm});
    if(editModal==='vt')updateCar(carId,{vt:editForm});
    setEditModal(null);
  };

  const kmModalJSX=(
    <Modal visible={kmModal} transparent animationType="fade" onRequestClose={()=>setKmModal(false)}>
      <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',padding:24}}>
        <View style={{backgroundColor:'#fff',borderRadius:24,padding:24}}>
          <Text style={{fontSize:18,fontWeight:'800',color:C.text,marginBottom:6}}>🔢 Mise à jour kilométrage</Text>
          <Text style={{fontSize:13,color:C.textLight,marginBottom:16}}>Kilométrage actuel : {fmtKm(car.km)}</Text>
          <TextInput value={newKm} onChangeText={v=>{setNewKm(v.replace(/\D/g,''));setKmError('');}}
            keyboardType="number-pad" placeholder={String(car.km||0)}
            style={{backgroundColor:'#fafafa',borderWidth:2,borderColor:kmError?C.danger:C.primary,borderRadius:12,paddingHorizontal:16,paddingVertical:14,fontSize:20,fontWeight:'700',textAlign:'center',color:C.text,marginBottom:8}}
            blurOnSubmit={false}/>
          {kmError?<Text style={{color:C.danger,fontSize:13,textAlign:'center',marginBottom:8}}>{kmError}</Text>:null}
          <Text style={{fontSize:11,color:C.textLight,textAlign:'center',marginBottom:16}}>Le nouveau kilométrage doit être ≥ {fmtKm(car.km)}</Text>
          <View style={{flexDirection:'row',gap:10}}>
            <Btn label="Annuler" variant="outline" onPress={()=>setKmModal(false)} style={{flex:1}}/>
            <Btn label="Enregistrer" onPress={()=>{
              const n=parseInt(newKm);
              if(isNaN(n)||n<(car.km||0)){setKmError(`Kilométrage invalide (min: ${car.km||0} km)`);return;}
              updateCar(carId,{km:n});setKmModal(false);
              Alert.alert('✅ Mis à jour',`Kilométrage mis à jour : ${n.toLocaleString('fr-FR')} km`);
            }} style={{flex:2}}/>
          </View>
        </View>
      </View>
    </Modal>
  );

  const allChecked=CHECKLIST_VOYAGE.every(item=>checklist[item.id]);
  const checklistJSX=(
    <Modal visible={checklistModal} transparent animationType="slide" onRequestClose={()=>setChecklistModal(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} activeOpacity={1} onPress={()=>setChecklistModal(false)}/>
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,padding:24,maxHeight:'80%'}}>
          <View style={{alignItems:'center',marginBottom:16}}>
            <View style={{width:40,height:4,backgroundColor:C.border,borderRadius:2,marginBottom:12}}/>
            <Text style={{fontSize:18,fontWeight:'800',color:C.text}}>🗺️ Checklist Voyage</Text>
            <Text style={{fontSize:12,color:C.textLight,marginTop:4}}>{CHECKLIST_VOYAGE.filter(i=>checklist[i.id]).length}/{CHECKLIST_VOYAGE.length} éléments vérifiés</Text>
          </View>
          <View style={{height:4,backgroundColor:'#f3f4f6',borderRadius:2,marginBottom:16}}>
            <View style={{height:'100%',borderRadius:2,backgroundColor:allChecked?C.success:C.primary,width:`${Math.round(CHECKLIST_VOYAGE.filter(i=>checklist[i.id]).length/CHECKLIST_VOYAGE.length*100)}%`}}/>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CHECKLIST_VOYAGE.map(item=>(
              <TouchableOpacity key={item.id} onPress={()=>setChecklist(c=>({...c,[item.id]:!c[item.id]}))}
                style={{flexDirection:'row',alignItems:'center',gap:14,paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#f3f4f6'}}>
                <View style={{width:28,height:28,borderRadius:14,backgroundColor:checklist[item.id]?C.success:C.border,alignItems:'center',justifyContent:'center'}}>
                  {checklist[item.id]&&<Text style={{color:'#fff',fontWeight:'800',fontSize:14}}>✓</Text>}
                </View>
                <Text style={{fontSize:18}}>{item.icon}</Text>
                <Text style={{fontSize:14,flex:1,color:checklist[item.id]?C.textLight:C.text,textDecorationLine:checklist[item.id]?'line-through':'none',fontWeight:'500'}}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {allChecked&&<View style={{backgroundColor:C.successLight,borderRadius:12,padding:14,alignItems:'center',marginTop:16}}>
            <Text style={{color:C.success,fontWeight:'800',fontSize:15}}>✅ Véhicule prêt pour le voyage !</Text>
          </View>}
          <TouchableOpacity onPress={()=>setChecklist({})} style={{alignItems:'center',marginTop:12}}>
            <Text style={{fontSize:13,color:C.textLight}}>Réinitialiser</Text>
          </TouchableOpacity>
          <View style={{height:10}}/>
        </View>
      </Modal>
  );

  const EditModalComponent=()=>(
    <Modal visible={!!editModal} transparent animationType="slide" onRequestClose={()=>setEditModal(null)}>
      <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} activeOpacity={1} onPress={()=>setEditModal(null)}/>
      <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,padding:24}}>
        <View style={{alignItems:'center',marginBottom:16}}>
          <View style={{width:40,height:4,backgroundColor:C.border,borderRadius:2,marginBottom:12}}/>
          <Text style={{fontSize:17,fontWeight:'800',color:C.text}}>
            {editModal==='assurance'?'🛡️ Modifier l\'assurance':editModal==='vignette'?'🏷️ Modifier la vignette':'✅ Modifier la visite technique'}
          </Text>
        </View>
        {editModal==='assurance'&&<>
          <Dropdown label="Compagnie" value={editForm.compagnie||''} options={ASSURANCES_MA} onSelect={v=>setEditForm(f=>({...f,compagnie:v}))} placeholder="Choisir la compagnie"/>
          <DatePicker future label="Date échéance" value={editForm.echeance||''} onChange={v=>setEditForm(f=>({...f,echeance:v}))}/>
          <Input label="Montant (DH)" value={String(editForm.montant||'')} onChangeText={v=>setEditForm(f=>({...f,montant:Number(v)||0}))} keyboardType="number-pad"/>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <Text style={{fontSize:13,fontWeight:'600',color:C.textMed}}>Renouvelée / Payée</Text>
            <Switch value={!!editForm.payee} onValueChange={v=>setEditForm(f=>({...f,payee:v}))} trackColor={{true:C.primary}}/>
          </View>
        </>}
        {editModal==='vignette'&&<>
          <Input label="Montant vignette (DH)" value={String(editForm.montant||'')} onChangeText={v=>setEditForm(f=>({...f,montant:Number(v)||0}))} keyboardType="number-pad"/>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <Text style={{fontSize:13,fontWeight:'600',color:C.textMed}}>Vignette payée</Text>
            <Switch value={!!editForm.payee} onValueChange={v=>setEditForm(f=>({...f,payee:v}))} trackColor={{true:C.primary}}/>
          </View>
        </>}
        {editModal==='vt'&&<>
          <DatePicker label="Date dernière VT" value={editForm.derniere||''} onChange={v=>setEditForm(f=>({...f,derniere:v}))}/>
          <DatePicker future label="Date échéance VT" value={editForm.echeance||''} onChange={v=>setEditForm(f=>({...f,echeance:v}))}/>
          <Input label="Centre de contrôle" value={editForm.centre||''} onChangeText={v=>setEditForm(f=>({...f,centre:v}))} placeholder="Ex: Auto Contrôle"/>
        </>}
        <View style={{flexDirection:'row',gap:10,marginTop:8}}>
          <Btn label="Annuler" variant="outline" onPress={()=>setEditModal(null)} style={{flex:1}}/>
          <Btn label="Enregistrer ✓" onPress={saveEdit} style={{flex:2}}/>
        </View>
        <View style={{height:16}}/>
      </View>
    </Modal>
  );

  const TABS=[['entretien','Entretien'],['historique','Historique'],['depenses','Dépenses'],['infos','Infos']];
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      {kmModalJSX}
      {checklistJSX}
      <EditModalComponent/>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark}/>
      <View style={{backgroundColor:C.primary,padding:20,paddingBottom:24}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16}}>
          <TouchableOpacity onPress={()=>navigation.goBack()} style={{backgroundColor:'rgba(255,255,255,0.15)',width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:18}}>←</Text>
          </TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={{color:'#fff',fontSize:18,fontWeight:'800'}}>{car.marque} {car.modele}</Text>
            <Text style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>{fmtImmat(car.immat)} · {car.annee}</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('AddCar',{carId})} style={{backgroundColor:'rgba(255,255,255,0.15)',width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:16}}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor:'rgba(255,255,255,0.12)',borderRadius:16,padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <View>
            <Text style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>Kilométrage actuel</Text>
            <Text style={{color:'#fff',fontSize:28,fontWeight:'800',marginTop:2}}>{(car.km||0).toLocaleString('fr-FR')} km</Text>
          </View>
          <TouchableOpacity onPress={()=>{setNewKm(String(car.km||''));setKmError('');setKmModal(true);}} style={{backgroundColor:'#fff',borderRadius:12,paddingHorizontal:16,paddingVertical:10}}>
            <Text style={{color:C.primary,fontWeight:'700',fontSize:13}}>Mettre à jour</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flexDirection:'row',backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:C.border}}>
        {TABS.map(([key,label])=>(
          <TouchableOpacity key={key} onPress={()=>setTab(key)} style={{flex:1,paddingVertical:14,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===key?C.primary:'transparent'}}>
            <Text style={{fontSize:12,fontWeight:'600',color:tab===key?C.primary:C.textLight}}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{padding:16}} showsVerticalScrollIndicator={false}>
        {tab==='entretien'&&<>
          <Card>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><Text style={{fontSize:15,fontWeight:'700'}}>🔧 Révision</Text><Badge status={rs}/></View>
            <InfoRow label="Dernière révision" value={`${fmtKm(car.revision?.dernierKm)} · ${fmtDate(car.revision?.derniereDate)}`}/>
            <InfoRow label="Fréquence" value={fmtKm(car.revision?.frequence||10000)}/>
            <InfoRow label="Prochaine révision" value={fmtKm(nextRevKm(car))}/>
            <InfoRow label="Restant" value={`${(nextRevKm(car)-(car.km||0)).toLocaleString('fr-FR')} km`}/>
            <InfoRow label="Garage" value={car.revision?.garage} last/>
          </Card>
          <Card>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{fontSize:15,fontWeight:'700'}}>🛡️ Assurance</Text>
              <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
                <Badge status={as}/>
                <TouchableOpacity onPress={()=>setEditModal('assurance')} style={{backgroundColor:C.primaryLight,borderRadius:8,padding:6}}><Text style={{fontSize:14}}>✏️</Text></TouchableOpacity>
              </View>
            </View>
            <InfoRow label="Compagnie" value={car.assurance?.compagnie}/>
            <InfoRow label="Échéance" value={fmtDate(car.assurance?.echeance)}/>
            <InfoRow label="Montant" value={fmtMoney(car.assurance?.montant)}/>
            <InfoRow label="Statut" value={car.assurance?.payee?'Renouvelée ✅':'À renouveler'} last/>
            {(()=>{
              const d=car.assurance?.echeance?Math.round((new Date(car.assurance.echeance)-new Date())/86400000):null;
              if(d!==null&&d>30&&car.assurance?.payee)return null;
              const renouveler=()=>{const oldDate=car.assurance?.echeance?new Date(car.assurance.echeance):new Date();const newDate=new Date(oldDate);newDate.setFullYear(newDate.getFullYear()+1);updateCar(carId,{assurance:{...car.assurance,payee:true,echeance:newDate.toISOString().split('T')[0]}});};
              return(<TouchableOpacity onPress={renouveler} style={{marginTop:10,backgroundColor:C.primaryLight,borderRadius:10,padding:10,alignItems:'center'}}>
                <Text style={{fontSize:13,fontWeight:'700',color:C.primary}}>🔄 Renouveler l'assurance (+1 an)</Text>
              </TouchableOpacity>);
            })()}
          </Card>
          <Card>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{fontSize:15,fontWeight:'700'}}>✅ Visite technique</Text>
              <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
                <Badge status={vs} label={!vtApp?'N/A':SL[vs]}/>
                {vtApp&&<TouchableOpacity onPress={()=>setEditModal('vt')} style={{backgroundColor:C.primaryLight,borderRadius:8,padding:6}}><Text style={{fontSize:14}}>✏️</Text></TouchableOpacity>}
              </View>
            </View>
            {!vtApp?<Text style={{fontSize:13,color:C.textLight}}>Non applicable — {carAge(car.dateMEC).toFixed(1)} an(s). Obligatoire à partir de 5 ans.</Text>
              :car.vt?.echeance?<><InfoRow label="Dernière VT" value={fmtDate(car.vt.derniere)}/><InfoRow label="Échéance" value={fmtDate(car.vt.echeance)}/><InfoRow label="Centre" value={car.vt.centre} last/></>
              :<Text style={{fontSize:13,color:C.danger}}>⚠️ Visite technique non renseignée — appuyez ✏️</Text>}
          </Card>
          <Card>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{fontSize:15,fontWeight:'700'}}>🏷️ Vignette</Text>
              <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
                <Badge status={car.vignette?.payee?'ok':'warning'} label={car.vignette?.payee?'Payée':'À payer'}/>
                <TouchableOpacity onPress={()=>setEditModal('vignette')} style={{backgroundColor:C.primaryLight,borderRadius:8,padding:6}}><Text style={{fontSize:14}}>✏️</Text></TouchableOpacity>
              </View>
            </View>
            <InfoRow label="Montant" value={fmtMoney(car.vignette?.montant)} last/>
            {!car.vignette?.payee&&<TouchableOpacity onPress={()=>updateCar(carId,{vignette:{...car.vignette,payee:true}})} style={{marginTop:10,backgroundColor:C.successLight,borderRadius:10,padding:10,alignItems:'center'}}>
              <Text style={{fontSize:13,fontWeight:'700',color:C.success}}>✅ Marquer comme payée</Text>
            </TouchableOpacity>}
          </Card>
          {car.adblue&&car.adblueData&&<Card style={{marginTop:4}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{fontSize:15,fontWeight:'700'}}>💧 AdBlue</Text>
              <Badge status={(car.adblueData.prochainKm-(car.km||0))<=0?'urgent':(car.adblueData.prochainKm-(car.km||0))<=500?'warning':'ok'} label={(car.adblueData.prochainKm-(car.km||0))<=0?'À remplir':(car.adblueData.prochainKm-(car.km||0))<=500?'Bientôt':'OK'}/>
            </View>
            <InfoRow label="Dernier remplissage" value={fmtKm(car.adblueData.dernierKm)}/>
            <InfoRow label="Distance entre remplissages" value={fmtKm(car.adblueData.distance||10000)}/>
            <InfoRow label="Prochain estimé" value={fmtKm(car.adblueData.prochainKm)}/>
            <InfoRow label="Restant avant remplissage" value={`${Math.max(0,(car.adblueData.prochainKm-(car.km||0))).toLocaleString('fr-FR')} km`} last/>
          </Card>}
          <Btn label="+ Ajouter une opération" onPress={()=>navigation.navigate('AddOp',{carId})} style={{marginTop:4}}/>
          <TouchableOpacity onPress={()=>setChecklistModal(true)} style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,backgroundColor:'#fff',borderWidth:2,borderColor:'#10b981',borderRadius:12,paddingVertical:14,marginTop:8}}>
            <Text style={{fontSize:18}}>🗺️</Text>
            <Text style={{fontSize:15,fontWeight:'700',color:'#10b981'}}>Checklist Voyage</Text>
          </TouchableOpacity>
        </>}
        {tab==='historique'&&<>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
            <View style={{flexDirection:'row',gap:8,paddingHorizontal:2}}>
              {PERIODES.map(p=>(
                <TouchableOpacity key={p} onPress={()=>setPeriode(p)} style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:periode===p?C.primary:C.primaryLight}}>
                  <Text style={{fontSize:12,fontWeight:'600',color:periode===p?'#fff':C.primary}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <View>
              <Text style={{fontSize:15,fontWeight:'700'}}>Historique ({filteredOps.length})</Text>
              {periode!=='Tout'&&<Text style={{fontSize:11,color:C.textLight}}>Période : {periode}</Text>}
            </View>
            <TouchableOpacity onPress={()=>navigation.navigate('AddOp',{carId})} style={{backgroundColor:C.primary,borderRadius:10,paddingHorizontal:14,paddingVertical:8}}>
              <Text style={{color:'#fff',fontWeight:'600',fontSize:13}}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {filteredOps.length===0?<Card style={{alignItems:'center',padding:30}}><Text style={{fontSize:13,color:C.textLight}}>Aucune opération {periode!=='Tout'?'sur cette période':''}</Text></Card>
            :filteredOps.map(op=>(
              <Card key={op.id}>
                <View style={{flexDirection:'row',gap:12}}>
                  <View style={{width:44,height:44,borderRadius:12,backgroundColor:C.primaryLight,alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Text style={{fontSize:20}}>🔧</Text>
                  </View>
                  <View style={{flex:1}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                      <Text style={{fontSize:14,fontWeight:'700',color:C.text,flex:1}}>{op.type}</Text>
                      <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
                        <Text style={{fontSize:14,fontWeight:'700',color:C.primary}}>{fmtMoney(op.montant)}</Text>
                        <TouchableOpacity onPress={()=>navigation.navigate('AddOp',{carId,editOp:op})} style={{backgroundColor:C.primaryLight,borderRadius:8,padding:6}}>
                          <Text style={{fontSize:14}}>✏️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{fontSize:12,color:C.textLight,marginTop:2}}>{fmtDate(op.date)} · {fmtKm(op.km)}</Text>
                    {op.garage?<Text style={{fontSize:12,color:C.textLight}}>{op.garage}</Text>:null}
                    {op.note?<Text style={{fontSize:12,color:C.textMed,fontStyle:'italic',marginTop:2}}>{op.note}</Text>:null}
                  </View>
                </View>
              </Card>
            ))}
        </>}
        {tab==='depenses'&&<>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
            <View style={{flexDirection:'row',gap:8,paddingHorizontal:2}}>
              {PERIODES.map(p=>(
                <TouchableOpacity key={p} onPress={()=>setPeriode(p)} style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:periode===p?C.primary:C.primaryLight}}>
                  <Text style={{fontSize:12,fontWeight:'600',color:periode===p?'#fff':C.primary}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Card style={{alignItems:'center',padding:24}}>
            <Text style={{fontSize:13,color:C.textLight}}>Total dépensé</Text>
            <Text style={{fontSize:36,fontWeight:'800',color:C.primary,marginTop:4}}>{fmtMoney(totalDep)}</Text>
            <Text style={{fontSize:12,color:'#9ca3af',marginTop:4}}>{filteredOps.length} opérations · {periode!=='Tout'?periode:'Toutes périodes'}</Text>
          </Card>
          {filteredOps.length>0&&(()=>{
            const byType={};filteredOps.forEach(o=>{byType[o.type]=(byType[o.type]||0)+(Number(o.montant)||0);});
            return<Card>
              <Text style={{fontSize:15,fontWeight:'700',marginBottom:14}}>Par type</Text>
              {Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type,montant],i)=>(
                <View key={type} style={{marginBottom:10}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:4}}>
                    <Text style={{fontSize:13,color:C.textMed,flex:1}}>{type}</Text>
                    <Text style={{fontSize:13,fontWeight:'700'}}>{fmtMoney(montant)}</Text>
                  </View>
                  <View style={{height:6,backgroundColor:'#f3f4f6',borderRadius:3}}>
                    <View style={{height:'100%',borderRadius:3,width:`${Math.round(montant/totalDep*100)}%`,backgroundColor:[C.primary,'#0e9f6e',C.warning,C.danger,'#8b5cf6'][i%5]}}/>
                  </View>
                </View>
              ))}
            </Card>;
          })()}
          {filteredOps.length>0&&<>
            <TouchableOpacity onPress={()=>setShowDepDetail(v=>!v)} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:C.primaryLight,borderRadius:12,padding:14,marginBottom:8}}>
              <Text style={{fontSize:14,fontWeight:'700',color:C.primary}}>{showDepDetail?'▲ Masquer les détails':'▼ Voir les détails'}</Text>
              <Text style={{fontSize:12,color:C.textLight}}>{filteredOps.length} opérations</Text>
            </TouchableOpacity>
            {showDepDetail&&filteredOps.map(op=>(
              <Card key={op.id} style={{marginBottom:8}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:14,fontWeight:'700',color:C.text}}>{op.type}</Text>
                    <Text style={{fontSize:12,color:C.textLight,marginTop:3}}>{fmtDate(op.date)} · {fmtKm(op.km)}</Text>
                    {op.garage?<Text style={{fontSize:12,color:C.textLight}}>{op.garage}</Text>:null}
                    {op.note?<Text style={{fontSize:12,color:C.textMed,fontStyle:'italic',marginTop:2}}>{op.note}</Text>:null}
                  </View>
                  <Text style={{fontSize:15,fontWeight:'800',color:C.primary,marginLeft:10}}>{fmtMoney(op.montant)}</Text>
                </View>
              </Card>
            ))}
          </>}
        </>}
        {tab==='infos'&&<>
          <Card>
            <Text style={{fontSize:15,fontWeight:'700',marginBottom:12}}>Informations</Text>
            <InfoRow label="Marque" value={car.marque}/>
            <InfoRow label="Modèle" value={car.modele}/>
            <InfoRow label="Version" value={car.version}/>
            <InfoRow label="Immatriculation" value={fmtImmat(car.immat)}/>
            <InfoRow label="Année" value={String(car.annee||'')}/>
            <InfoRow label="1ère MEC" value={fmtDate(car.dateMEC)}/>
            <InfoRow label="Carburant" value={car.carburant}/>
            <InfoRow label="AdBlue" value={car.adblue?'Oui':'Non'} last/>
          </Card>
          <Btn label="🗑️ Supprimer ce véhicule" variant="danger"
            onPress={()=>Alert.alert('Supprimer',`Supprimer ${car.marque} ${car.modele} ?`,[{text:'Annuler'},{text:'Supprimer',style:'destructive',onPress:()=>{deleteCar(carId);navigation.goBack();}}])}/>
        </>}
        <View style={{height:80}}/>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── AJOUT VOITURE ────────────────────────────────────────────────────────────
const AddCarScreen=({route,navigation})=>{
  const{carId}=route.params||{};
  const{cars,addCar,updateCar}=useApp();
  const ex=carId?cars.find(c=>c.id===carId):null;
  const[loading,setLoading]=useState(false);
  const[form,setForm]=useState({
    marque:ex?.marque||'',modele:ex?.modele||'',version:ex?.version||'',
    immat:ex?.immat||'',annee:String(ex?.annee||new Date().getFullYear()),
    dateMEC:ex?.dateMEC||today(),km:String(ex?.km||'0'),
    carburant:ex?.carburant||'Essence',adblue:ex?.adblue||false,color:ex?.color||C.primary,
    assurance:ex?.assurance||{compagnie:'',echeance:'',montant:'',payee:false},
    revision:ex?.revision||{dernierKm:'0',derniereDate:today(),frequence:'10000',garage:''},
    vignette:ex?.vignette||{payee:false,montant:''},
    vt:ex?.vt||{derniere:'',echeance:'',centre:''},
    adblueData:ex?.adblueData||{dernierKm:'0',distance:'10000'},
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setSub=(sub,k,v)=>setForm(f=>({...f,[sub]:{...f[sub],[k]:v}}));
  const vtApp=form.dateMEC?carAge(form.dateMEC)>=5:false;
  const modeles=form.marque?MARQUES_MODELES[form.marque]||['Autre']:[];
  const handleSave=async()=>{
    if(!form.marque||!form.modele||!form.immat){Alert.alert('Erreur','Marque, modèle et immatriculation sont obligatoires');return;}
    setLoading(true);
    const data={...form,annee:Number(form.annee),km:Number(form.km),
      revision:{...form.revision,dernierKm:Number(form.revision.dernierKm),frequence:Number(form.revision.frequence)},
      assurance:{...form.assurance,montant:Number(form.assurance.montant)||0},
      vignette:{...form.vignette,montant:Number(form.vignette.montant)||0},
      adblueData:form.adblue?{dernierKm:Number(form.adblueData.dernierKm)||0,distance:Number(form.adblueData.distance)||10000,prochainKm:(Number(form.adblueData.dernierKm)||0)+(Number(form.adblueData.distance)||10000)}:null,
    };
    if(carId)await updateCar(carId,data);else await addCar(data);
    setLoading(false);navigation.goBack();
  };
  return(
    <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderBottomWidth:1,borderBottomColor:C.border}}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{width:36,height:36,backgroundColor:'#f3f4f6',borderRadius:10,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:18}}>✕</Text>
        </TouchableOpacity>
        <Text style={{fontSize:17,fontWeight:'700'}}>{carId?'Modifier le véhicule':'Ajouter un véhicule'}</Text>
        <View style={{width:36}}/>
      </View>
      <ScrollView contentContainerStyle={{padding:20}} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Informations générales</Text>
        <Dropdown label="Marque" required value={form.marque} options={MARQUES} onSelect={v=>{set('marque',v);set('modele','');}} placeholder="Choisir la marque"/>
        {form.marque?<Dropdown label="Modèle" required value={form.modele} options={modeles} onSelect={v=>set('modele',v)} placeholder="Choisir le modèle"/>:null}
        <Input label="Version" value={form.version} onChangeText={v=>set('version',v)} placeholder="Ex: 1.5 TSI (optionnel)"/>
        <ImmatInput value={form.immat} onChange={v=>set('immat',v)}/>
        <Input label="Année" value={form.annee} onChangeText={v=>set('annee',v)} keyboardType="number-pad"/>
        <DatePicker label="Date 1ère mise en circulation" required value={form.dateMEC} onChange={v=>set('dateMEC',v)}/>
        <Input label="Kilométrage actuel" required value={form.km} onChangeText={v=>set('km',v)} keyboardType="number-pad" placeholder="Ex: 45000"/>
        <Dropdown label="Carburant" value={form.carburant} options={CARBURANTS} onSelect={v=>set('carburant',v)}/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <Text style={{fontSize:13,fontWeight:'600',color:C.textMed}}>AdBlue</Text>
          <Switch value={form.adblue} onValueChange={v=>set('adblue',v)} trackColor={{true:C.primary}}/>
        </View>
        {form.adblue&&<>
          <Input label="Km dernier remplissage AdBlue" value={String(form.adblueData.dernierKm)} onChangeText={v=>setSub('adblueData','dernierKm',v.replace(/\D/g,''))} keyboardType="number-pad" placeholder="Ex: 82500"/>
          <Input label="Distance entre remplissages (km)" value={String(form.adblueData.distance||'10000')} onChangeText={v=>setSub('adblueData','distance',v.replace(/\D/g,''))} keyboardType="number-pad" placeholder="10000"/>
          <Text style={{fontSize:11,color:C.textLight,marginTop:-10,marginBottom:16}}>Prochain estimé : {((Number(form.adblueData.dernierKm)||0)+(Number(form.adblueData.distance)||10000)).toLocaleString('fr-FR')} km</Text>
        </>}
        <Text style={{fontSize:13,fontWeight:'600',color:C.textMed,marginBottom:8}}>Couleur</Text>
        <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
          {COULEURS_CAR.map(color=>(
            <TouchableOpacity key={color} onPress={()=>set('color',color)}
              style={{width:34,height:34,borderRadius:17,backgroundColor:color,borderWidth:form.color===color?3:1,borderColor:color==='#ffffff'?'#d1d5db':'#fff',shadowColor:color==='#ffffff'?'#999':color,shadowOffset:{width:0,height:2},shadowOpacity:form.color===color?0.6:0.1,shadowRadius:4,elevation:form.color===color?4:1}}/>
          ))}
        </View>
        <Text style={styles.section}>🔧 Révision</Text>
        <Input label="Km dernière révision" value={String(form.revision.dernierKm)} onChangeText={v=>setSub('revision','dernierKm',v)} keyboardType="number-pad"/>
        <DatePicker label="Date dernière révision" value={form.revision.derniereDate} onChange={v=>setSub('revision','derniereDate',v)}/>
        <Dropdown label="Fréquence révision (km)" value={String(form.revision.frequence)} options={FREQUENCES_KM} onSelect={v=>setSub('revision','frequence',v)}/>
        <Dropdown label="Garage" value={form.revision.garage} options={GARAGES} onSelect={v=>setSub('revision','garage',v)} placeholder="Choisir le garage"/>
        <Text style={styles.section}>🛡️ Assurance</Text>
        <Dropdown label="Compagnie" value={form.assurance.compagnie} options={ASSURANCES_MA} onSelect={v=>setSub('assurance','compagnie',v)} placeholder="Choisir la compagnie"/>
        <DatePicker label="Date échéance assurance" future value={form.assurance.echeance} onChange={v=>setSub('assurance','echeance',v)}/>
        <Input label="Montant annuel (DH)" value={String(form.assurance.montant)} onChangeText={v=>setSub('assurance','montant',v)} keyboardType="number-pad"/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <Text style={{fontSize:13,fontWeight:'600',color:C.textMed}}>Assurance payée</Text>
          <Switch value={form.assurance.payee} onValueChange={v=>setSub('assurance','payee',v)} trackColor={{true:C.primary}}/>
        </View>
        <Text style={styles.section}>🏷️ Vignette</Text>
        <Input label="Montant vignette (DH)" value={String(form.vignette.montant)} onChangeText={v=>setSub('vignette','montant',v)} keyboardType="number-pad"/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <Text style={{fontSize:13,fontWeight:'600',color:C.textMed}}>Vignette payée</Text>
          <Switch value={form.vignette.payee} onValueChange={v=>setSub('vignette','payee',v)} trackColor={{true:C.primary}}/>
        </View>
        {vtApp&&<>
          <Text style={styles.section}>✅ Visite technique</Text>
          <DatePicker label="Date dernière VT" value={form.vt?.derniere||''} onChange={v=>setSub('vt','derniere',v)}/>
          <DatePicker label="Date échéance VT" future value={form.vt?.echeance||''} onChange={v=>setSub('vt','echeance',v)}/>
          <Input label="Centre de contrôle" value={form.vt?.centre||''} onChangeText={v=>setSub('vt','centre',v)} placeholder="Ex: Auto Contrôle"/>
        </>}
        <Btn label={carId?'Enregistrer les modifications':'Ajouter le véhicule'} onPress={handleSave} loading={loading} style={{marginTop:8,marginBottom:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── AJOUT OPÉRATION ──────────────────────────────────────────────────────────
const AddOpScreen=({route,navigation})=>{
  const{carId,editOp}=route.params;
  const{cars,addOperation,updateOperation,updateCar}=useApp();
  const car=cars.find(c=>c.id===carId);
  const isEdit=!!editOp;
  const[form,setForm]=useState({
    date:editOp?.date||today(),km:String(editOp?.km||car?.km||''),
    type:editOp?.type||'Vidange complète (huile + filtres)',
    garage:editOp?.garage||'',montant:String(editOp?.montant||''),note:editOp?.note||'',
  });
  const[loading,setLoading]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const handleSave=async()=>{
    if(!form.date||!form.km){Alert.alert('Erreur','Date et kilométrage obligatoires');return;}
    setLoading(true);
    if(isEdit){
      if(editOp.id==='rev_init'){
        await updateCar(carId,{
          revision:{
            ...car.revision,
            type:form.type,
            derniereDate:form.date,
            dernierKm:Number(form.km),
            garage:form.garage,
            montant:Number(form.montant)||0,
            note:form.note||"Révision initiale",
          }
        });
      }else{
        await updateOperation(carId,editOp.id,{...form,km:Number(form.km),montant:Number(form.montant)||0});
      }
    }else await addOperation(carId,{...form,km:Number(form.km),montant:Number(form.montant)||0});
    setLoading(false);navigation.goBack();
  };
  return(
    <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderBottomWidth:1,borderBottomColor:C.border}}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{width:36,height:36,backgroundColor:'#f3f4f6',borderRadius:10,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:18}}>✕</Text>
        </TouchableOpacity>
        <Text style={{fontSize:17,fontWeight:'700'}}>{isEdit?'Modifier l\'opération':'Nouvelle opération'}</Text>
        <View style={{width:36}}/>
      </View>
      <ScrollView contentContainerStyle={{padding:20}} keyboardShouldPersistTaps="handled">
        <Text style={{fontSize:14,fontWeight:'600',color:C.textLight,marginBottom:20}}>{car?.marque} {car?.modele} · {fmtImmat(car?.immat)}</Text>
        <DatePicker label="Date" required value={form.date} onChange={v=>set('date',v)}/>
        <Input label="Kilométrage" required value={form.km} onChangeText={v=>set('km',v)} keyboardType="number-pad"/>
        <Dropdown label="Type d'opération" value={form.type} options={OP_TYPES} onSelect={v=>set('type',v)}/>
        <Dropdown label="Garage / Prestataire" value={form.garage} options={GARAGES} onSelect={v=>set('garage',v)} placeholder="Choisir (optionnel)"/>
        <Input label="Montant (DH)" value={form.montant} onChangeText={v=>set('montant',v)} keyboardType="number-pad" placeholder="0"/>
        <Input label="Commentaire" value={form.note} onChangeText={v=>set('note',v)} placeholder="Optionnel" multiline numberOfLines={3}/>
        <Btn label={isEdit?"Enregistrer les modifications":"Enregistrer l'opération"} onPress={handleSave} loading={loading} style={{marginTop:8,marginBottom:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NotificationsScreen=({navigation})=>{
  const{cars,updateCar}=useApp();
  const alerts=[];
  cars.forEach(car=>{
    const name=`${car.marque} ${car.modele}`;
    const rs=revStatus(car);const as=assStatus(car);const vs=vtStatus(car);const nr=nextRevKm(car);
    if(rs==='urgent')alerts.push({type:'urgent',car:name,carId:car.id,msg:`Révision dépassée ! (${fmtKm(car.km)} / ${fmtKm(nr)})`,action:null});
    else if(rs==='warning')alerts.push({type:'warning',car:name,carId:car.id,msg:`Révision dans ${(nr-car.km).toLocaleString('fr-FR')} km`,action:null});
    if(as==='urgent'){
      const renouvelerAss=()=>{const oldDate=car.assurance?.echeance?new Date(car.assurance.echeance):new Date();const newDate=new Date(oldDate);newDate.setFullYear(newDate.getFullYear()+1);updateCar(car.id,{assurance:{...car.assurance,payee:true,echeance:newDate.toISOString().split('T')[0]}});};
      alerts.push({type:'urgent',car:name,carId:car.id,msg:`Assurance expirée le ${fmtDate(car.assurance?.echeance)}`,action:renouvelerAss,actionLabel:'🔄 Renouveler (+1 an)'});
    } else if(as==='warning'){
      const d=Math.round((new Date(car.assurance.echeance)-new Date())/86400000);
      const renouvelerAss=()=>{const oldDate=new Date(car.assurance.echeance);const newDate=new Date(oldDate);newDate.setFullYear(newDate.getFullYear()+1);updateCar(car.id,{assurance:{...car.assurance,payee:true,echeance:newDate.toISOString().split('T')[0]}});};
      alerts.push({type:'warning',car:name,carId:car.id,msg:`Assurance expire dans ${d} jours`,action:renouvelerAss,actionLabel:'🔄 Renouveler (+1 an)'});
    }
    if(vs==='urgent'&&carAge(car.dateMEC)>=5)alerts.push({type:'urgent',car:name,carId:car.id,msg:'Visite technique expirée ou non faite',action:null});
    if(!car.vignette?.payee)alerts.push({type:'warning',car:name,carId:car.id,msg:`Vignette ${new Date().getFullYear()} non payée`,action:()=>updateCar(car.id,{vignette:{...car.vignette,payee:true}}),actionLabel:'✅ Marquer comme payée'});
  });
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <View style={{backgroundColor:'#fff',padding:20,borderBottomWidth:1,borderBottomColor:C.border}}>
        <Text style={{fontSize:20,fontWeight:'800',color:C.text}}>🔔 Alertes</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:16}}>
        {alerts.length===0?<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:56}}>✅</Text><Text style={{fontSize:18,fontWeight:'700',color:C.text,marginTop:12}}>Tout est à jour !</Text><Text style={{fontSize:14,color:C.textLight,marginTop:6}}>Aucune alerte en cours</Text></View>
          :alerts.map((a,i)=>(
            <Card key={i} onPress={()=>navigation.navigate('CarDetail',{carId:a.carId})}>
              <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
                <View style={{width:44,height:44,borderRadius:12,backgroundColor:a.type==='urgent'?'#fee2e2':'#fef3c7',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Text style={{fontSize:18}}>{a.type==='urgent'?'🔴':'🟡'}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:13,fontWeight:'700',color:C.text}}>{a.car}</Text>
                  <Text style={{fontSize:13,color:C.textLight,marginTop:2}}>{a.msg}</Text>
                  <Text style={{fontSize:11,color:C.primary,marginTop:4}}>Appuyer pour voir le détail ›</Text>
                </View>
              </View>
              {a.action&&<TouchableOpacity onPress={a.action} style={{marginTop:10,backgroundColor:C.successLight,borderRadius:10,padding:10,alignItems:'center'}}>
                <Text style={{fontSize:13,fontWeight:'700',color:C.success}}>{a.actionLabel||'✅ Marquer comme traité'}</Text>
              </TouchableOpacity>}
            </Card>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── DÉPENSES ─────────────────────────────────────────────────────────────────
const DepensesScreen=()=>{
  const{cars,operations}=useApp();
  const allOps=Object.values(operations).flat();
  const total=allOps.reduce((s,o)=>s+(Number(o.montant)||0),0);
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <View style={{backgroundColor:'#fff',padding:20,borderBottomWidth:1,borderBottomColor:C.border}}>
        <Text style={{fontSize:20,fontWeight:'800',color:C.text}}>💰 Dépenses</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:16}}>
        <Card style={{alignItems:'center',padding:24}}>
          <Text style={{fontSize:13,color:C.textLight}}>Total tous véhicules</Text>
          <Text style={{fontSize:36,fontWeight:'800',color:C.primary,marginTop:4}}>{fmtMoney(total)}</Text>
          <Text style={{fontSize:12,color:'#9ca3af',marginTop:4}}>{allOps.length} opérations · {cars.length} véhicule{cars.length>1?'s':''}</Text>
        </Card>
        {cars.map(car=>{
          const ops=operations[car.id]||[];const t=ops.reduce((s,o)=>s+(Number(o.montant)||0),0);
          if(!ops.length)return null;
          const byType={};ops.forEach(o=>{byType[o.type]=(byType[o.type]||0)+(Number(o.montant)||0);});
          return<Card key={car.id}>
            <Text style={{fontSize:15,fontWeight:'700',marginBottom:12}}>{car.marque} {car.modele}</Text>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}><Text style={{fontSize:13,color:C.textLight}}>Total</Text><Text style={{fontSize:16,fontWeight:'800',color:C.primary}}>{fmtMoney(t)}</Text></View>
            {Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([type,montant],i)=>(
              <View key={type} style={{marginBottom:8}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}><Text style={{fontSize:12,color:C.textLight}}>{type}</Text><Text style={{fontSize:12,fontWeight:'600'}}>{fmtMoney(montant)}</Text></View>
                <View style={{height:4,backgroundColor:'#f3f4f6',borderRadius:2}}><View style={{height:'100%',borderRadius:2,width:`${Math.round(montant/t*100)}%`,backgroundColor:[C.primary,'#0e9f6e',C.warning,C.danger][i%4]}}/></View>
              </View>
            ))}
          </Card>;
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────
const SettingsScreen=({navigation})=>{
  const{cars,syncStatus,syncFromCloud,restoreFromDrive,setSyncStatus}=useApp();
  const[userName,setUserName]=useState('');
  const[userEmail,setUserEmail]=useState('');
  const[syncMsg,setSyncMsg]=useState('');
  const[lastSync,setLastSync]=useState('');
  const[driveEnabled,setDriveEnabled]=useState(false);
  const[conflictModal,setConflictModal]=useState(false);
  const[conflictData,setConflictData]=useState(null);

  useEffect(()=>{
    AsyncStorage.getItem('userName').then(n=>setUserName(n||''));
    AsyncStorage.getItem('g_user').then(u=>{if(u){const p=JSON.parse(u);setUserEmail(p.email||'');}});
    AsyncStorage.getItem('last_sync').then(t=>{if(t)setLastSync(new Date(Number(t)).toLocaleString('fr-FR'));});
    gHasDriveScope().then(setDriveEnabled);
  },[]);

  const handleSync=async()=>{
    setSyncMsg('☁️ Synchronisation en cours...');
    const token=await getAccessToken();
    if(!token){setSyncMsg('❌ Token introuvable — reconnectez-vous');setTimeout(()=>setSyncMsg(''),5000);return;}
    const lc=await AsyncStorage.getItem('cars');
    const lo=await AsyncStorage.getItem('operations');
    const ok=await driveWriteBackup(token,{cars:lc?JSON.parse(lc):[],operations:lo?JSON.parse(lo):{}});
    const now=Date.now();
    if(ok){await AsyncStorage.setItem('last_sync',String(now));setLastSync(new Date(now).toLocaleString('fr-FR'));setSyncMsg('✅ Synchronisation effectuée !');}
    else setSyncMsg('❌ Échec de synchronisation');
    setTimeout(()=>setSyncMsg(''),5000);
  };

  const handleSignOut=()=>{
    Alert.alert('Déconnexion','Voulez-vous vous déconnecter ?\n\nVos données locales sont conservées.',[
      {text:'Annuler'},
      {text:'Se déconnecter',style:'destructive',onPress:async()=>{await gSignOut();navigation.replace('Login');}},
    ]);
  };

  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <Modal visible={conflictModal} transparent animationType="fade" onRequestClose={()=>setConflictModal(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',padding:24}}>
          <View style={{backgroundColor:'#fff',borderRadius:24,padding:24}}>
            <Text style={{fontSize:18,fontWeight:'800',color:C.text,marginBottom:8}}>☁️ Données trouvées sur Drive</Text>
            <Text style={{fontSize:13,color:C.textLight,marginBottom:16,lineHeight:20}}>Une sauvegarde plus récente existe dans votre Google Drive.{'\n'}Que voulez-vous faire ?</Text>
            <View style={{backgroundColor:C.primaryLight,borderRadius:12,padding:12,marginBottom:16}}>
              <Text style={{fontSize:13,color:C.primary,fontWeight:'600'}}>📅 {conflictData?.lastUpdated?new Date(conflictData.lastUpdated).toLocaleString('fr-FR'):'—'}</Text>
              <Text style={{fontSize:13,color:C.primary,marginTop:4}}>🚗 {conflictData?.cars?.length||0} véhicule(s)</Text>
            </View>
            <Btn label="☁️ Restaurer depuis Drive" onPress={async()=>{setConflictModal(false);await restoreFromDrive(conflictData);setSyncMsg('✅ Données restaurées !');setTimeout(()=>setSyncMsg(''),4000);}} style={{marginBottom:10}}/>
            <Btn label="📱 Garder mes données locales" variant="outline" onPress={()=>setConflictModal(false)}/>
          </View>
        </View>
      </Modal>
      <View style={{backgroundColor:'#fff',padding:20,borderBottomWidth:1,borderBottomColor:C.border}}>
        <Text style={{fontSize:20,fontWeight:'800',color:C.text}}>⚙️ Paramètres</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:16}}>
        <Card style={{marginBottom:12}}>
          <Text style={{fontSize:13,fontWeight:'700',color:C.textLight,marginBottom:12}}>MON COMPTE</Text>
          <View style={{flexDirection:'row',gap:14,alignItems:'center'}}>
            <View style={{width:56,height:56,borderRadius:28,backgroundColor:C.primary,alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:22,color:'#fff',fontWeight:'800'}}>{userName.charAt(0).toUpperCase()||'?'}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:16,fontWeight:'700',color:C.text}}>{userName}</Text>
              <Text style={{fontSize:13,color:C.textLight,marginTop:2}}>{userEmail}</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:4}}>
                <View style={{width:8,height:8,borderRadius:4,backgroundColor:syncStatus==='synced'?C.success:C.warning}}/>
                <Text style={{fontSize:11,color:syncStatus==='synced'?C.success:C.warning,fontWeight:'600'}}>
                  {syncStatus==='synced'?'Compte synchronisé ☁️':syncStatus==='syncing'?'Sync en cours...':'Hors ligne'}
                </Text>
              </View>
            </View>
          </View>
        </Card>
        <Card style={{marginBottom:12}}>
          {[
            ['📱','Application','AutoCarnet v1.0.0'],
            ['🚗','Véhicules',`${cars.length} véhicule${cars.length>1?'s':''}`],
            ['☁️','Dernière sync',lastSync||'Jamais'],
            ['💾','Stockage',driveEnabled?'Google Drive (appDataFolder)':'Local uniquement'],
          ].map(([emoji,label,sub],i,arr)=>(
            <View key={label} style={{flexDirection:'row',alignItems:'center',gap:14,paddingVertical:12,borderBottomWidth:i<arr.length-1?1:0,borderBottomColor:C.border}}>
              <Text style={{fontSize:20}}>{emoji}</Text>
              <View style={{flex:1}}>
                <Text style={{fontWeight:'600',fontSize:13,color:C.text}}>{label}</Text>
                <Text style={{fontSize:12,color:C.textLight,marginTop:1}}>{sub}</Text>
              </View>
            </View>
          ))}
        </Card>
        {!driveEnabled&&<Card style={{backgroundColor:'#fffbeb',borderWidth:1,borderColor:'#fde68a',marginBottom:8}}>
          <Text style={{fontSize:14,fontWeight:'700',color:'#92400e',marginBottom:4}}>☁️ Sauvegarde cloud non activée</Text>
          <Text style={{fontSize:12,color:'#78350f',marginBottom:10,lineHeight:18}}>Reconnectez-vous pour activer la sauvegarde Drive.</Text>
          <Btn label="Se reconnecter" onPress={handleSignOut} style={{backgroundColor:'#f59e0b'}}/>
        </Card>}
        {syncMsg?<View style={{backgroundColor:syncMsg.includes('✅')?C.successLight:C.warningLight,borderRadius:12,padding:12,alignItems:'center',marginBottom:10}}>
          <Text style={{color:syncMsg.includes('✅')?C.success:C.warning,fontWeight:'700',fontSize:13}}>{syncMsg}</Text>
        </View>:null}
        {driveEnabled&&<><Btn label="☁️ Synchroniser maintenant" variant="outline" onPress={handleSync}/><View style={{height:8}}/></>}
        <Btn label="🚪 Se déconnecter" variant="outline" onPress={handleSignOut} style={{borderColor:C.danger}}/>
        <View style={{height:10}}/>
        <Btn label="🗑️ Effacer les données locales" variant="danger"
          onPress={()=>Alert.alert('Effacer','Effacer uniquement les données locales ?',[
            {text:'Annuler'},
            {text:'Effacer',style:'destructive',onPress:async()=>{await AsyncStorage.multiRemove(['cars','operations']);navigation.replace('Main');}},
          ])}/>
        <Text style={{textAlign:'center',fontSize:11,color:'#9ca3af',marginTop:16}}>© AdiLam — AutoCarnet v1.0.0</Text>
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
};



// ─── ÉVOLUTIONS V2 : ASSISTANT, RAPPORTS, CONSEILS, ARGUS ─────────────────────
const getOpsForCar=(operations,carId)=>operations[carId]||[];
const totalOps=(ops)=>ops.reduce((sum,o)=>sum+(Number(o.montant)||0),0);
const recentOps=(ops,limit=5)=>[...ops].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,limit);

const estimateArgus=(car,ops=[])=>{
  if(!car)return {min:0,max:0,label:'Non disponible',score:0};
  const year=Number(car.annee)||new Date(car.dateMEC||today()).getFullYear()||new Date().getFullYear();
  const age=Math.max(0,new Date().getFullYear()-year);
  const km=Number(car.km)||0;
  const premium=['Audi','BMW','Mercedes','Land Rover','Volvo'].includes(car.marque);
  const mid=['Volkswagen','Toyota','Hyundai','Kia','Peugeot','Renault','Nissan','Honda','Mazda','Skoda'].includes(car.marque);
  let base=premium?380000:mid?210000:145000;
  if(['Q5','X3','GLC','Tiguan','3008','Sportage','Tucson','RAV4','Qashqai'].includes(car.modele))base*=1.25;
  if(['Polo','Clio','208','Sandero','Picanto','i10','Yaris'].includes(car.modele))base*=0.65;
  let value=base*Math.pow(0.88,age);
  const expectedKm=Math.max(15000,age*18000);
  if(km>expectedKm)value*=Math.max(0.68,1-((km-expectedKm)/100000)*0.18);
  if(km<expectedKm*0.75)value*=1.05;
  const hasRecentRevision=ops.some(o=>String(o.type||'').toLowerCase().includes('vidange')||String(o.type||'').toLowerCase().includes('révision'));
  if(hasRecentRevision)value*=1.03;
  if(globalStatus(car)==='urgent')value*=0.94;
  const min=Math.max(15000,Math.round(value*0.88/1000)*1000);
  const max=Math.max(min+5000,Math.round(value*1.08/1000)*1000);
  const score=globalStatus(car)==='ok'?85:globalStatus(car)==='warning'?68:52;
  return {min,max,label:'Estimation indicative',score};
};

const KnowledgeCard=({title,items})=>(
  <Card>
    <Text style={{fontSize:15,fontWeight:'800',color:C.text,marginBottom:10}}>{title}</Text>
    {items.map((it,i)=><Text key={i} style={{fontSize:13,color:C.textMed,lineHeight:20,marginBottom:6}}>• {it}</Text>)}
  </Card>
);

const AssistantScreen=({navigation})=>{
  const{cars,operations}=useApp();
  const[selected,setSelected]=useState(cars[0]?.id||'');
  const car=cars.find(c=>c.id===selected)||cars[0];
  const ops=car?getOpsForCar(operations,car.id):[];
  const[checks,setChecks]=useState({});
  useEffect(()=>{if(!selected&&cars[0])setSelected(cars[0].id);},[cars.length]);
  const argus=estimateArgus(car,ops);
  const tasks=car?[
    {id:'rev',label:`Révision : prochaine à ${fmtKm(nextRevKm(car))}`,status:revStatus(car)},
    {id:'ass',label:`Assurance : ${fmtDate(car.assurance?.echeance)}`,status:assStatus(car)},
    {id:'vt',label:`Visite technique : ${carAge(car.dateMEC)<5?'non applicable':fmtDate(car.vt?.echeance)}`,status:vtStatus(car)},
    {id:'vig',label:`Vignette : ${car.vignette?.payee?'payée':'à vérifier'}`,status:car.vignette?.payee?'ok':'warning'},
  ]:[];
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark}/>
      <View style={{backgroundColor:C.primary,padding:20,paddingBottom:24}}>
        <Text style={{color:'#fff',fontSize:24,fontWeight:'800'}}>Assistant auto</Text>
        <Text style={{color:'rgba(255,255,255,0.75)',fontSize:13,marginTop:4}}>Checklists, rappels, conseils et estimation</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:90}}>
        {cars.length>0&&<Dropdown label="Véhicule" value={car?`${car.marque} ${car.modele}`:''} options={cars.map(c=>`${c.marque} ${c.modele}`)} onSelect={v=>{const c=cars.find(x=>`${x.marque} ${x.modele}`===v);if(c)setSelected(c.id);}}/>}
        {!car?<Card style={{alignItems:'center',padding:35}}><Text style={{fontSize:42}}>🚗</Text><Text style={{fontWeight:'800',fontSize:16,marginTop:8}}>Ajoutez d’abord un véhicule</Text></Card>:<>
          <Card>
            <Text style={{fontSize:15,fontWeight:'800',marginBottom:10}}>🎯 À faire / Fait</Text>
            {tasks.map(t=>(
              <TouchableOpacity key={t.id} onPress={()=>setChecks(c=>({...c,[t.id]:!c[t.id]}))} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#f3f4f6'}}>
                <View style={{width:24,height:24,borderRadius:12,backgroundColor:checks[t.id]?C.success:SB[t.status],alignItems:'center',justifyContent:'center'}}>{checks[t.id]&&<Text style={{color:'#fff',fontWeight:'800'}}>✓</Text>}</View>
                <Text style={{flex:1,fontSize:13,color:C.textMed,textDecorationLine:checks[t.id]?'line-through':'none'}}>{t.label}</Text>
                <Badge status={t.status}/>
              </TouchableOpacity>
            ))}
          </Card>
          <Card>
            <Text style={{fontSize:15,fontWeight:'800',marginBottom:8}}>💰 Estimation Argus</Text>
            <Text style={{fontSize:28,fontWeight:'900',color:C.primary}}>{fmtMoney(argus.min)} - {fmtMoney(argus.max)}</Text>
            <Text style={{fontSize:12,color:C.textLight,marginTop:4}}>Estimation indicative basée sur marque, modèle, année, kilométrage et entretien.</Text>
          </Card>
          <KnowledgeCard title="🧠 Conseils entretien" items={[`Surveillez la révision avant ${fmtKm(nextRevKm(car))}.`,`Gardez les factures : elles améliorent la valeur de revente.`,`Avant voyage : pneus, niveaux, éclairage, assurance, vignette et documents.`]}/>
          <KnowledgeCard title="🛒 Achat / vente" items={["Pour vendre : photos propres, historique clair, prix justifié, documents prêts.","Pour acheter : vérifier carte grise, historique, kilométrage, pneus, boîte, fuites et visite technique.","Toujours prévoir une expertise avant paiement définitif."]}/>
        </>}
      </ScrollView>
    </SafeAreaView>
  );
};

const ReportsScreen=()=>{
  const{cars,operations}=useApp();
  const[selected,setSelected]=useState(cars[0]?.id||'');
  useEffect(()=>{if(!selected&&cars[0])setSelected(cars[0].id);},[cars.length]);
  const car=cars.find(c=>c.id===selected)||cars[0];
  const ops=car?getOpsForCar(operations,car.id):[];
  const argus=estimateArgus(car,ops);
  const totalGlobal=cars.reduce((sum,c)=>sum+totalOps(getOpsForCar(operations,c.id)),0);
  return(
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark}/>
      <View style={{backgroundColor:C.primary,padding:20,paddingBottom:24}}>
        <Text style={{color:'#fff',fontSize:24,fontWeight:'800'}}>Rapports</Text>
        <Text style={{color:'rgba(255,255,255,0.75)',fontSize:13,marginTop:4}}>Fiche véhicule, dépenses, vente et global</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:90}}>
        {cars.length>0&&<Dropdown label="Véhicule" value={car?`${car.marque} ${car.modele}`:''} options={cars.map(c=>`${c.marque} ${c.modele}`)} onSelect={v=>{const c=cars.find(x=>`${x.marque} ${x.modele}`===v);if(c)setSelected(c.id);}}/>}
        {!car?<Card style={{alignItems:'center',padding:35}}><Text style={{fontSize:42}}>📄</Text><Text style={{fontWeight:'800',fontSize:16,marginTop:8}}>Aucun rapport disponible</Text></Card>:<>
          <Card>
            <Text style={{fontSize:16,fontWeight:'900',color:C.text,marginBottom:10}}>📄 Rapport véhicule</Text>
            <InfoRow label="Véhicule" value={`${car.marque} ${car.modele} ${car.annee||''}`}/>
            <InfoRow label="Immatriculation" value={fmtImmat(car.immat)}/>
            <InfoRow label="Kilométrage" value={fmtKm(car.km)}/>
            <InfoRow label="Dépenses entretien" value={fmtMoney(totalOps(ops))}/>
            <InfoRow label="Nombre opérations" value={String(ops.length)} last/>
          </Card>
          <Card>
            <Text style={{fontSize:16,fontWeight:'900',color:C.text,marginBottom:10}}>🚘 Rapport de vente</Text>
            <InfoRow label="Prix estimatif" value={`${fmtMoney(argus.min)} - ${fmtMoney(argus.max)}`}/>
            <InfoRow label="Statut global" value={SL[globalStatus(car)]}/>
            <InfoRow label="Assurance" value={fmtDate(car.assurance?.echeance)}/>
            <InfoRow label="Visite technique" value={carAge(car.dateMEC)<5?'N/A':fmtDate(car.vt?.echeance)} last/>
            <Text style={{fontSize:12,color:C.textLight,marginTop:10,lineHeight:18}}>Version actuelle : rapport affiché dans l’application. Export PDF/partage WhatsApp/Email nécessitera l’ajout des packages Expo adaptés.</Text>
          </Card>
          <Card>
            <Text style={{fontSize:16,fontWeight:'900',color:C.text,marginBottom:10}}>🧾 Dernières opérations</Text>
            {recentOps(ops,5).length===0?<Text style={{fontSize:13,color:C.textLight}}>Aucune opération.</Text>:recentOps(ops,5).map(o=><InfoRow key={o.id} label={`${fmtDate(o.date)} · ${o.type}`} value={fmtMoney(o.montant)}/>)}
          </Card>
        </>}
        <Card>
          <Text style={{fontSize:16,fontWeight:'900',color:C.text,marginBottom:10}}>🌍 Rapport global</Text>
          <InfoRow label="Nombre véhicules" value={String(cars.length)}/>
          <InfoRow label="Dépenses totales" value={fmtMoney(totalGlobal)} last/>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles=StyleSheet.create({
  section:{fontSize:16,fontWeight:'800',color:C.text,marginTop:24,marginBottom:16,paddingBottom:8,borderBottomWidth:2,borderBottomColor:C.primaryLight},
});
const Stack=createStackNavigator();
const Tab=createBottomTabNavigator();
const MainTabs=()=>(
  <Tab.Navigator screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#f3f4f6',paddingBottom:6,paddingTop:6,height:64},tabBarActiveTintColor:C.primary,tabBarInactiveTintColor:C.textLight,tabBarLabelStyle:{fontSize:11,fontWeight:'600'}}}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{tabBarLabel:'Véhicules',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>🚗</Text>}}/>
    <Tab.Screen name="Notifications" component={NotificationsScreen} options={{tabBarLabel:'Alertes',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>🔔</Text>}}/>
    <Tab.Screen name="Depenses" component={DepensesScreen} options={{tabBarLabel:'Dépenses',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>💰</Text>}}/>
    <Tab.Screen name="Assistant" component={AssistantScreen} options={{tabBarLabel:'Assistant',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>🧠</Text>}}/>
    <Tab.Screen name="Reports" component={ReportsScreen} options={{tabBarLabel:'Rapports',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>📄</Text>}}/>
    <Tab.Screen name="Settings" component={SettingsScreen} options={{tabBarLabel:'Paramètres',tabBarIcon:({focused})=><Text style={{fontSize:focused?22:20,opacity:focused?1:0.6}}>⚙️</Text>}}/>
  </Tab.Navigator>
);

export default function App(){
  return(
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Main" component={MainTabs}/>
            <Stack.Screen name="CarDetail" component={CarDetailScreen}/>
            <Stack.Screen name="AddCar" component={AddCarScreen} options={{presentation:'modal'}}/>
            <Stack.Screen name="AddOp" component={AddOpScreen} options={{presentation:'modal'}}/>
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
