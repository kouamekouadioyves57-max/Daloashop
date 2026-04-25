import { useState, useEffect, useRef, useCallback } from "react";

const COMMISSION_RATE = 0.10;
const ADMIN_ID = "admin_daloashop";

const DB = {
  get(k) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};

const SEED = [
  { id:"p1", name:"Tissu Wax 6 yards", price:4500, oldPrice:6000, category:"Mode", seller:"Boutique Awa", sellerId:"seller1", stock:12, img:null, emoji:"🧵", rating:4.8, reviews:34, badge:"Promo", desc:"Wax de qualité supérieure, motifs africains variés." },
  { id:"p2", name:"Mangues fraîches (5 kg)", price:1500, oldPrice:null, category:"Alimentation", seller:"Ferme Koffi", sellerId:"seller2", stock:50, img:null, emoji:"🥭", rating:4.9, reviews:89, badge:"Populaire", desc:"Mangues cultivées à Daloa, sucrées et juteuses." },
  { id:"p3", name:"Téléphone Tecno Spark 20", price:65000, oldPrice:72000, category:"Électronique", seller:"Tech Daloa", sellerId:"seller3", stock:3, img:null, emoji:"📱", rating:4.5, reviews:15, badge:"Promo", desc:"Écran 6.6\", batterie 5000 mAh, double SIM, 128 Go." },
  { id:"p4", name:"Boubou brodé homme", price:22000, oldPrice:null, category:"Mode", seller:"Boutique Awa", sellerId:"seller1", stock:4, img:null, emoji:"👘", rating:4.9, reviews:28, badge:"Top vendeur", desc:"Boubou en bazin riche, broderie main." },
  { id:"p5", name:"Huile de palme pure (5 L)", price:3200, oldPrice:null, category:"Alimentation", seller:"Ferme Koffi", sellerId:"seller2", stock:30, img:null, emoji:"🫙", rating:4.8, reviews:67, badge:null, desc:"Huile rouge non raffinée, pressée artisanalement." },
  { id:"p6", name:"Ventilateur de table 16\"", price:18000, oldPrice:22000, category:"Électronique", seller:"Tech Daloa", sellerId:"seller3", stock:6, img:null, emoji:"🌀", rating:4.3, reviews:19, badge:"Promo", desc:"3 vitesses, oscillation automatique, silencieux." },
  { id:"p7", name:"Crème karité naturelle", price:2500, oldPrice:null, category:"Beauté", seller:"Beauty Daloa", sellerId:"seller4", stock:20, img:null, emoji:"🧴", rating:4.7, reviews:42, badge:"Nouveau", desc:"Karité pur 100% naturel, hydratant intense." },
  { id:"p8", name:"Sac à main cuir local", price:12000, oldPrice:15000, category:"Mode", seller:"Boutique Awa", sellerId:"seller1", stock:8, img:null, emoji:"👜", rating:4.6, reviews:22, badge:"Promo", desc:"Cuir véritable, artisanat ivoirien." },
];

const PROMO_CODES = {
  "DALOA10":   { type:"percent", value:10,   label:"10% de réduction" },
  "BIENVENUE": { type:"fixed",   value:1000, label:"1 000 FCFA offerts" },
  "FETE500":   { type:"fixed",   value:500,  label:"500 FCFA de réduction" },
  "PROMO20":   { type:"percent", value:20,   label:"20% de réduction" },
};

const ORDER_STATUSES = [
  { key:"confirmed", label:"Confirmée",      icon:"✅", desc:"Commande reçue et validée" },
  { key:"preparing", label:"En préparation", icon:"📦", desc:"Le vendeur prépare votre colis" },
  { key:"shipped",   label:"En livraison",   icon:"🛵", desc:"Votre livreur est en route" },
  { key:"delivered", label:"Livrée",         icon:"🎉", desc:"Commande bien reçue !" },
];

const CATS = ["Tous","Mode","Alimentation","Électronique","Beauté","Maison","Agriculture"];

const PAY_METHODS = [
  { id:"mtn",    label:"MTN Mobile Money",        icon:"📱" },
  { id:"orange", label:"Orange Money",            icon:"🟠" },
  { id:"moov",   label:"Moov Money",              icon:"💜" },
  { id:"wave",   label:"Wave",                    icon:"🌊" },
  { id:"cash",   label:"Paiement à la livraison", icon:"💵" },
];

const BANNERS = [
  { bg:"linear-gradient(135deg,#FF6B2B,#FF4500)", emoji:"🛍️", title:"Le marché de Daloa\ndans votre téléphone", sub:"Livraison rapide • Paiement Mobile Money", cta:"Acheter maintenant", target:"shop" },
  { bg:"linear-gradient(135deg,#1a1a2e,#16213e)", emoji:"📱", title:"Tech à prix choc\nDaloa Edition", sub:"Jusqu'à -20% sur l'électronique", cta:"Voir les promos", target:"shop", cat:"Électronique", badge:"TECH WEEK" },
  { bg:"linear-gradient(135deg,#22c55e,#15803d)", emoji:"🥭", title:"Produits frais locaux\nlivrés chez vous", sub:"Directement des fermes de Daloa", cta:"Commander", target:"shop", cat:"Alimentation", badge:"LOCAL" },
  { bg:"linear-gradient(135deg,#8B5CF6,#6D28D9)", emoji:"🏪", title:"Vendez sur Daloa Shop\n100% gratuit !", sub:"Aucun abonnement • Seulement 10% sur vos ventes", cta:"Devenir vendeur", target:"seller-signup", badge:"GRATUIT" },
];const I = ({ n, s=20, c="currentColor" }) => {
  const d = {
    cart:    '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.64 16h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    user:    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    store:   '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    trash:   '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    check:   '<polyline points="20 6 9 17 4 12"/>',
    truck:   '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    grid:    '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    back:    '<polyline points="15 18 9 12 15 6"/>',
    box:     '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    edit:    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    logout:  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    bell:    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    eye:     '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    upload:  '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    ticket:  '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    shield:  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    map:     '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  };
  return (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
      dangerouslySetInnerHTML={{__html: d[n]||""}}/>
  );
};

const Stars = ({ r=0, small }) => (
  <span style={{display:"flex",gap:1}}>
    {[1,2,3,4,5].map(i=>(
      <span key={i} style={{color:i<=Math.round(r)?"#FF6B2B":"#ddd",fontSize:small?10:13}}>★</span>
    ))}
  </span>
);

const NotifPopup = ({ notif, onClose }) => {
  useEffect(()=>{ const t=setTimeout(onClose,6000); return()=>clearTimeout(t); },[]);
  const isAdmin = notif.for==="admin";
  return (
    <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",
      background:isAdmin?"#1a1a2e":"#fff",color:isAdmin?"#fff":"#111",
      borderRadius:18,padding:"16px 20px",zIndex:10000,
      boxShadow:"0 12px 48px rgba(0,0,0,0.22)",minWidth:300,maxWidth:"92vw",
      border:`2px solid ${isAdmin?"#FF6B2B":"#22c55e"}`,
      animation:"slideDown .4s cubic-bezier(.34,1.56,.64,1)",
      display:"flex",gap:14,alignItems:"flex-start"}}>
      <div style={{width:44,height:44,borderRadius:14,flexShrink:0,
        background:isAdmin?"rgba(255,107,43,0.15)":"#f0fdf4",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
        {isAdmin?"🔔":"🛒"}
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:900,fontSize:13,marginBottom:3}}>
          {isAdmin?"🏪 Daloa Shop — Nouvelle commande":"🎉 Nouvelle commande reçue !"}
        </div>
        <div style={{fontSize:12,opacity:.8,lineHeight:1.5}}>{notif.message}</div>
        {notif.contacts&&(
          <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
            <a href={`tel:${notif.contacts.clientPhone}`} style={{background:"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20,textDecoration:"none"}}>📞 Client</a>
            <a href={`tel:${notif.contacts.sellerPhone}`} style={{background:"#FF6B2B",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20,textDecoration:"none"}}>🏪 Vendeur</a>
          </div>
        )}
      </div>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",opacity:.5,padding:0,color:"inherit",fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
};

const NotifPanel = ({ notifs, onClose, onClear, isAdmin }) => (
  <div style={{position:"fixed",top:0,right:0,bottom:0,width:320,maxWidth:"95vw",
    background:"#fff",zIndex:5000,boxShadow:"-8px 0 40px rgba(0,0,0,0.14)",
    display:"flex",flexDirection:"column",animation:"slideLeft .3s ease"}}>
    <div style={{padding:"20px 16px 14px",background:"#1a1a2e",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontWeight:900,fontSize:16}}>{isAdmin?"🏪 Admin Daloa Shop":"🔔 Mes notifications"}</div>
        <div style={{fontSize:11,opacity:.7,marginTop:2}}>{notifs.length} notification{notifs.length>1?"s":""}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {notifs.length>0&&<button style={{fontSize:10,fontWeight:800,color:"#FF6B2B",background:"rgba(255,107,43,0.15)",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer"}} onClick={onClear}>Effacer</button>}
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
      {notifs.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"#999"}}>
          <div style={{fontSize:48,marginBottom:12}}>🔕</div>
          <div style={{fontWeight:700}}>Aucune notification</div>
        </div>
      ):notifs.map(n=>(
        <div key={n.id} style={{background:n.read?"#f9f9f9":"#fff8f5",border:`1.5px solid ${n.read?"#f0f0f0":"#FFD4B8"}`,borderRadius:14,padding:14}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{fontSize:24,flexShrink:0}}>{n.emoji||"🔔"}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:12,marginBottom:3}}>{n.title}</div>
              <div style={{fontSize:11,color:"#555",lineHeight:1.5,whiteSpace:"pre-line"}}>{n.message}</div>
              <div style={{fontSize:10,color:"#aaa",marginTop:5}}>{n.time}</div>
              {isAdmin&&n.contacts&&(
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  <a href={`tel:${n.contacts.clientPhone}`} style={{background:"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 12px",borderRadius:20,textDecoration:"none"}}>📞 Appeler client</a>
                  <a href={`tel:${n.contacts.sellerPhone}`} style={{background:"#FF6B2B",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 12px",borderRadius:20,textDecoration:"none"}}>🏪 Appeler vendeur</a>
                  <a href={`https://wa.me/${n.contacts.clientPhone?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{background:"#25D366",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 12px",borderRadius:20,textDecoration:"none"}}>💬 WhatsApp</a>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [category, setCategory] = useState("Tous");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [checkStep, setCheckStep] = useState(1);
  const [checkForm, setCheckForm] = useState({});
  const [payMethod, setPayMethod] = useState("mtn");
  const [processingPay, setProcessingPay] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [sellerNotifs, setSellerNotifs] = useState([]);
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [popupNotif, setPopupNotif] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadSeller, setUnreadSeller] = useState(0);
  const [unreadAdmin, setUnreadAdmin] = useState(0);
  const [sellerTab, setSellerTab] = useState("products");
  const [addForm, setAddForm] = useState({name:"",price:"",stock:"",category:"Mode",desc:"",emoji:"📦",img:null});
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [adminTab, setAdminTab] = useState("notifs");
  const [bannerIdx, setBannerIdx] = useState(0);
  const imgInputRef = useRef();
  const editImgRef = useRef();
  const bannerTimer = useRef(null);

  useEffect(() => {
    const u  = DB.get("ds:user");
    const p  = DB.get("ds:products");
    const c  = DB.get("ds:cart");
    const o  = DB.get("ds:orders");
    const w  = DB.get("ds:wishlist");
    const sn = DB.get("ds:notifs:seller");
    const an = DB.get("ds:notifs:admin");
    if (u) setUser(u);
    const prods = (p && p.length) ? p : SEED;
    setProducts(prods);
    if (!p || !p.length) DB.set("ds:products", SEED);
    if (c) setCart(c);
    if (o) setOrders(o);
    if (w) setWishlist(w);
    if (sn) { setSellerNotifs(sn); setUnreadSeller(sn.filter(n=>!n.read).length); }
    if (an) { setAdminNotifs(an); setUnreadAdmin(an.filter(n=>!n.read).length); }
    setLoading(false);
  }, []);

  useEffect(()=>{
    bannerTimer.current = setInterval(()=>setBannerIdx(i=>(i+1)%BANNERS.length), 4200);
    return()=>clearInterval(bannerTimer.current);
  },[]);

  const resetBanner = ()=>{
    clearInterval(bannerTimer.current);
    bannerTimer.current = setInterval(()=>setBannerIdx(i=>(i+1)%BANNERS.length), 4200);
  };

  const showToast = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const saveProducts = p => { setProducts(p); DB.set("ds:products",p); };

  const pushNotification = useCallback((order, sellerName, sellerPhone) => {
    const time = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    const items = order.items.slice(0,2).map(i=>i.name).join(", ")+(order.items.length>2?` +${order.items.length-2}`:"");
    const clientPhone = order.address?.phone||"—";
    const netAmount = Math.round(order.total*(1-COMMISSION_RATE));
    const commission = order.total - netAmount;
    const sn = { id:"sn_"+Date.now(), emoji:"🛒", title:`Nouvelle commande #${order.id}`,
      message:`${items}\nMontant net : ${netAmount.toLocaleString()} FCFA\nClient : ${order.buyerName} • ${order.address?.quartier}`,
      time, read:false };
    const an = { id:"an_"+Date.now(), emoji:"🔔", title:`Commande #${order.id} — ${sellerName}`,
      message:`Client : ${order.buyerName} (${clientPhone})\nVendeur : ${sellerName}\nArticles : ${items}\nTotal : ${order.total.toLocaleString()} F • Commission : ${commission.toLocaleString()} F`,
      time, read:false, contacts:{clientPhone, sellerPhone:sellerPhone||""} };
    const newSN = [sn,...sellerNotifs];
    const newAN = [an,...adminNotifs];
    setSellerNotifs(newSN); setAdminNotifs(newAN);
    setUnreadSeller(s=>s+1); setUnreadAdmin(s=>s+1);
    DB.set("ds:notifs:seller",newSN); DB.set("ds:notifs:admin",newAN);
    const isAdminUser = user?.id===ADMIN_ID;
    setPopupNotif(isAdminUser
      ? {...an, for:"admin", contacts:{clientPhone, sellerPhone:sellerPhone||""}}
      : user?.type==="seller"
        ? {...sn, for:"seller"}
        : {...an, for:"admin", contacts:{clientPhone, sellerPhone:sellerPhone||""}}
    );
  },[sellerNotifs,adminNotifs,user]);

  const markRead = type => {
    if(type==="seller"){ const n=sellerNotifs.map(x=>({...x,read:true})); setSellerNotifs(n); setUnreadSeller(0); DB.set("ds:notifs:seller",n); }
    else { const n=adminNotifs.map(x=>({...x,read:true})); setAdminNotifs(n); setUnreadAdmin(0); DB.set("ds:notifs:admin",n); }
  };
  const clearNotifs = type => {
    if(type==="seller"){ setSellerNotifs([]); setUnreadSeller(0); DB.set("ds:notifs:seller",[]); }
    else { setAdminNotifs([]); setUnreadAdmin(0); DB.set("ds:notifs:admin",[]); }
  };

  const addToCart = p => {
    const next = cart.find(i=>i.id===p.id)
      ? cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i)
      : [...cart,{...p,qty:1}];
    setCart(next); DB.set("ds:cart",next);
    showToast(`${p.name} ajouté au panier !`);
  };
  const removeFromCart = id => { const n=cart.filter(i=>i.id!==id); setCart(n); DB.set("ds:cart",n); };
  const updateQty = (id,d) => { const n=cart.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i); setCart(n); DB.set("ds:cart",n); };
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);

  const discountAmount = appliedPromo
    ? appliedPromo.type==="percent" ? Math.round(cartTotal*appliedPromo.value/100) : Math.min(appliedPromo.value,cartTotal)
    : 0;
  const finalTotal = cartTotal - discountAmount;
  const applyPromo = () => {
    const code=promoCode.trim().toUpperCase();
    const promo=PROMO_CODES[code];
    if(!promo){ showToast("Code invalide","error"); return; }
    setAppliedPromo({...promo,code}); showToast(`${promo.label} appliqué !`,"promo");
  };

  const toggleWishlist = id => {
    const n=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
    setWishlist(n); DB.set("ds:wishlist",n);
  };

  const loginAs = userData => {
    setUser(userData); DB.set("ds:user",userData);
    showToast(`Bienvenue, ${userData.name.split(" ")[0]} !`);
    setPage(userData.id===ADMIN_ID?"admin":userData.type==="seller"?"seller":"home");
  };
  const handleSocialLogin = async (provider,type="buyer") => {
    setAuthLoading(true);
    await new Promise(r=>setTimeout(r,900));
    const pf = {
      google:{ buyer:{name:"Kouadio Emmanuel",email:"kouadio@gmail.com",avatar:"KE",provider:"Google"},
               seller:{name:"Boutique Awa Daloa",email:"awa@gmail.com",avatar:"BA",provider:"Google"} },
      facebook:{ buyer:{name:"Amani Fatou",email:"fatou@fb.com",avatar:"AF",provider:"Facebook"},
                 seller:{name:"Ferme Koffi Bio",email:"koffi@fb.com",avatar:"FK",provider:"Facebook"} },
    };
    loginAs({...pf[provider][type],id:`${provider}_${type}_1`,type});
    setAuthLoading(false);
  };
  const handleEmailAuth = async () => {
    if(!authForm.email||!authForm.password){showToast("Remplis tous les champs","error");return;}
    if(authMode!=="login"&&!authForm.name){showToast("Ton nom est requis","error");return;}
    if(authForm.email==="admin@daloashop.ci"&&authForm.password==="admin123"){
      loginAs({id:ADMIN_ID,name:"Daloa Shop Admin",email:authForm.email,avatar:"DS",type:"admin",provider:"Email"});
      return;
    }
    setAuthLoading(true);
    await new Promise(r=>setTimeout(r,800));
    const type=authMode==="seller"?"seller":"buyer";
    loginAs({id:"em_"+Date.now(),name:authForm.name||authForm.email.split("@")[0],email:authForm.email,avatar:(authForm.name||authForm.email)[0].toUpperCase(),type,provider:"Email"});
    setAuthLoading(false);
  };
  const logout = () => { setUser(null); DB.set("ds:user",null); setPage("home"); showToast("Déconnecté"); };

  const handleImageFile = (file,onDone) => {
    if(!file) return;
    if(file.size>3*1024*1024){showToast("Image trop lourde (max 3 Mo)","error");return;}
    setUploadingImg(true);
    const r=new FileReader();
    r.onload=e=>{onDone(e.target.result);setUploadingImg(false);};
    r.onerror=()=>{showToast("Erreur","error");setUploadingImg(false);};
    r.readAsDataURL(file);
  };

  const submitProduct = (form,isEdit) => {
    if(!form.name||!form.price){showToast("Nom et prix requis","error");return;}
    if(isEdit){
      saveProducts(products.map(p=>p.id===form.id?{...p,...form,price:parseFloat(form.price),stock:parseInt(form.stock)||0}:p));
      setEditingProduct(null); showToast("Produit mis à jour ✓");
    } else {
      const np={...form,id:"p"+Date.now(),price:parseFloat(form.price),stock:parseInt(form.stock)||0,seller:user?.name,sellerId:user?.id,rating:0,reviews:0,badge:"Nouveau"};
      saveProducts([np,...products]);
      setAddForm({name:"",price:"",stock:"",category:"Mode",desc:"",emoji:"📦",img:null});
      showToast("Produit publié ✓");
    }
    setSellerTab("products");
  };
  const deleteProduct = id => { if(!window.confirm("Supprimer ?"))return; saveProducts(products.filter(p=>p.id!==id)); showToast("Supprimé"); };
  const updateStock = (id,d) => saveProducts(products.map(p=>p.id===id?{...p,stock:Math.max(0,p.stock+d)}:p));

  const placeOrder = async () => {
    setProcessingPay(true);
    await new Promise(r=>setTimeout(r,1800));
    const mainProd = products.find(p=>p.id===cart[0]?.id);
    const sellerName = mainProd?.seller||"Vendeur";
    const sellerPhone = "07 00 00 00";
    const commission = Math.round(finalTotal*COMMISSION_RATE);
    const netSeller = finalTotal - commission;
    const order = {
      id:"DS"+Date.now().toString().slice(-6),
      buyerId:user?.id, buyerName:user?.name,
      items:cart.map(i=>({...i})),
      total:finalTotal, originalTotal:cartTotal,
      discount:discountAmount, commission, netSeller,
      promoCode:appliedPromo?.code||null,
      date:new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}),
      status:"confirmed",
      statusHistory:[{key:"confirmed",at:Date.now()}],
      address:checkForm, payMethod, sellerName,
      createdAt:Date.now(),
    };
    const updatedP = products.map(p=>{
      const item=cart.find(i=>i.id===p.id);
      return item?{...p,stock:Math.max(0,p.stock-item.qty)}:p;
    });
    const newOrders=[order,...orders];
    setOrders(newOrders); setCart([]);
    setProcessingPay(false); setCheckStep(1); setCheckForm({});
    setAppliedPromo(null); setPromoCode("");
    DB.set("ds:orders",newOrders); saveProducts(updatedP); DB.set("ds:cart",[]);
    pushNotification(order, sellerName, sellerPhone);
    setSelectedProduct(order);
    setPage("order-confirm");
  };

  const isAdmin = user?.id===ADMIN_ID;
  const isSeller = user?.type==="seller";
  const myOrders = orders.filter(o=>o.buyerId===user?.id);
  const mySellerProds = products.filter(p=>p.sellerId===user?.id);
  const mySellerOrders = orders.filter(o=>o.items.some(i=>i.sellerId===user?.id));
  const filtered = products.filter(p=>{
    const catOk=category==="Tous"||p.category===category;
    const qOk=!query||p.name.toLowerCase().includes(query.toLowerCase())||p.seller?.toLowerCase().includes(query.toLowerCase());
    return catOk&&qOk;
  });
  const notifCount = isAdmin ? unreadAdmin : unreadSeller;
  const currentNotifs = isAdmin ? adminNotifs : sellerNotifs;

  const C = {or:"#FF6B2B",orL:"#FFF0E8",bg:"#f7f7f7",white:"#fff",dark:"#111",mid:"#555",light:"#999",border:"#ebebeb"};
  const btn = (bg=C.or,col="#fff",pad="11px 20px")=>({background:bg,color:col,border:"none",borderRadius:12,padding:pad,fontWeight:800,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .18s",fontFamily:"inherit"});
  const inp = {width:"100%",border:`1.5px solid ${C.border}`,borderRadius:11,padding:"12px 14px",fontSize:14,outline:"none",fontFamily:"inherit",color:C.dark,boxSizing:"border-box",background:C.white};
  const card = {background:C.white,borderRadius:18,overflow:"hidden",boxShadow:"0 2px 14px rgba(0,0,0,0.06)"};
  const lbl = {fontSize:12,fontWeight:800,color:C.mid,marginBottom:5,display:"block"};const Header = () => (
    <header style={{background:C.white,borderBottom:`2px solid ${C.or}`,position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 16px rgba(255,107,43,0.1)"}}>
      <div style={{maxWidth:700,margin:"0 auto",padding:"0 14px",display:"flex",alignItems:"center",gap:10,height:60}}>
        <div onClick={()=>setPage(isAdmin?"admin":"home")} style={{fontWeight:900,fontSize:20,color:C.or,cursor:"pointer",letterSpacing:-.5,lineHeight:1,userSelect:"none"}}>
          🛒 Daloa<span style={{color:C.dark}}>Shop</span>
          {isAdmin?<span style={{display:"block",fontSize:9,background:C.or,color:"#fff",borderRadius:6,padding:"1px 6px",marginTop:2,fontWeight:800}}>ADMIN</span>
            :<span style={{display:"block",fontSize:9,color:C.light,fontWeight:600,marginTop:-2}}>Marché de Daloa en ligne</span>}
        </div>
        {!isAdmin&&(
          <div style={{flex:1,display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:11,padding:"8px 12px",gap:8,border:`1.5px solid ${C.border}`}}>
            <I n="search" s={15} c={C.light}/>
            <input style={{border:"none",background:"none",outline:"none",flex:1,fontSize:13,color:C.dark,fontFamily:"inherit"}}
              placeholder="Rechercher…" value={query}
              onChange={e=>{setQuery(e.target.value);if(e.target.value)setPage("shop");}}/>
          </div>
        )}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user&&(isSeller||isAdmin)&&(
            <button style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:10,display:"flex",alignItems:"center"}}
              onClick={()=>{setShowNotifPanel(true);markRead(isAdmin?"admin":"seller");}}>
              <I n="bell" s={22} c={notifCount>0?C.or:C.light}/>
              {notifCount>0&&(
                <span style={{position:"absolute",top:-2,right:-2,background:"#FF4500",color:"#fff",fontSize:9,fontWeight:900,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #fff"}}>
                  {notifCount>9?"9+":notifCount}
                </span>
              )}
            </button>
          )}
          {user?(
            <div style={{width:34,height:34,borderRadius:"50%",background:isAdmin?"#1a1a2e":C.or,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,cursor:"pointer",border:"2px solid #fff",boxShadow:"0 2px 8px rgba(255,107,43,0.3)"}}
              onClick={()=>setPage(isAdmin?"admin":"profile")}>
              {user.avatar}
            </div>
          ):(
            <button style={{...btn(),padding:"8px 14px",fontSize:13}} onClick={()=>setPage("auth")}>
              <I n="user" s={14}/>Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const BottomNav = () => {
    if(isAdmin) return null;
    const items=[
      {id:"home",icon:"store",label:"Accueil"},
      {id:"shop",icon:"grid",label:"Boutique"},
      {id:"cart",icon:"cart",label:cartCount>0?`(${cartCount})`:"Panier"},
      {id:"orders",icon:"box",label:"Commandes"},
      {id:user?"profile":"auth",icon:"user",label:user?user.name.split(" ")[0].slice(0,8):"Connexion"},
    ];
    return (
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:C.white,borderTop:`1.5px solid ${C.border}`,display:"flex",zIndex:200,boxShadow:"0 -4px 24px rgba(0,0,0,0.07)"}}>
        {items.map(item=>{
          const active=page===item.id;
          return (
            <button key={item.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px 8px",cursor:"pointer",border:"none",background:"none",fontFamily:"inherit",gap:3}} onClick={()=>setPage(item.id)}>
              <I n={item.icon} s={20} c={active?C.or:C.light}/>
              <span style={{fontSize:9,fontWeight:800,color:active?C.or:C.light}}>{item.label}</span>
              {active&&<div style={{width:4,height:4,borderRadius:2,background:C.or}}/>}
            </button>
          );
        })}
      </nav>
    );
  };

  const PCard = ({p}) => (
    <div style={{...card,cursor:"pointer"}} onClick={()=>{setSelectedProduct(p);setPage("product");}}>
      <div style={{position:"relative"}}>
        <div style={{paddingTop:"100%",position:"relative",background:"linear-gradient(135deg,#FFF0E8,#ffe4d0)",borderRadius:"18px 18px 0 0"}}>
          {p.img?<img src={p.img} alt={p.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:"18px 18px 0 0"}}/>
            :<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{p.emoji||"📦"}</div>}
        </div>
        {p.badge&&<span style={{position:"absolute",top:8,left:8,background:p.badge==="Promo"?"#FF4500":p.badge==="Nouveau"?"#22c55e":p.badge==="Populaire"?"#3B82F6":"#8B5CF6",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:20}}>{p.badge}</span>}
        <button style={{position:"absolute",top:8,right:8,background:"rgba(255,255,255,0.9)",border:"none",width:30,height:30,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>{e.stopPropagation();toggleWishlist(p.id);}}>
          <span style={{fontSize:14,color:wishlist.includes(p.id)?C.or:"#ccc"}}>{wishlist.includes(p.id)?"♥":"♡"}</span>
        </button>
      </div>
      <div style={{padding:"10px 12px 12px"}}>
        <div style={{fontSize:12,fontWeight:800,lineHeight:1.3,marginBottom:3}}>{p.name}</div>
        <div style={{fontSize:10,color:C.light,marginBottom:5,cursor:"pointer",textDecoration:"underline"}}
          onClick={e=>{e.stopPropagation();setSelectedSeller({id:p.sellerId,name:p.seller});setPage("boutique");}}>
          🏪 {p.seller}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:8}}><Stars r={p.rating} small/><span style={{fontSize:9,color:C.light}}>({p.reviews})</span></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontWeight:900,color:C.or,fontSize:14}}>{p.price.toLocaleString()} F</div>
            {p.oldPrice&&<div style={{textDecoration:"line-through",color:"#ccc",fontSize:10}}>{p.oldPrice.toLocaleString()} F</div>}
          </div>
          <button style={{background:C.or,color:"#fff",border:"none",borderRadius:9,padding:"7px 10px",cursor:"pointer",display:"flex"}}
            onClick={e=>{e.stopPropagation();addToCart(p);}}>
            <I n="cart" s={13} c="#fff"/>
          </button>
        </div>
      </div>
    </div>
  );

  const HeroBanner = () => {
    const b=BANNERS[bannerIdx];
    return (
      <div style={{position:"relative",borderRadius:20,overflow:"hidden",marginBottom:20}}>
        <div key={bannerIdx} style={{background:b.bg,padding:"28px 20px 24px",color:"#fff",position:"relative",minHeight:180,animation:"bannerIn .4s ease"}}>
          {b.badge&&<span style={{background:"rgba(255,255,255,0.25)",color:"#fff",fontSize:9,fontWeight:900,padding:"4px 10px",borderRadius:20,letterSpacing:1.5,display:"inline-block",marginBottom:10}}>{b.badge}</span>}
          <div style={{position:"absolute",right:-20,top:-10,fontSize:110,opacity:.12}}>{b.emoji}</div>
          <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 8px",lineHeight:1.25,whiteSpace:"pre-line",maxWidth:"65%"}}>{b.title}</h2>
          <p style={{fontSize:12,opacity:.85,margin:"0 0 18px",maxWidth:"70%"}}>{b.sub}</p>
          <button style={{background:"rgba(255,255,255,0.2)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.5)",borderRadius:24,padding:"10px 18px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}
            onClick={()=>{if(b.target==="seller-signup"){setAuthMode("seller");setPage("auth");}else{if(b.cat)setCategory(b.cat);setPage("shop");}}}>
            {b.cta} →
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:6,padding:"10px 0 4px",background:C.white}}>
          {BANNERS.map((_,i)=><button key={i} style={{width:i===bannerIdx?22:7,height:7,borderRadius:4,background:i===bannerIdx?C.or:"#e0e0e0",border:"none",cursor:"pointer",transition:"all .3s",padding:0}} onClick={()=>{setBannerIdx(i);resetBanner();}}/>)}
        </div>
        {["left","right"].map(side=>(
          <button key={side} style={{position:"absolute",[side]:8,top:"38%",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={()=>{setBannerIdx(i=>side==="left"?(i-1+BANNERS.length)%BANNERS.length:(i+1)%BANNERS.length);resetBanner();}}>
            <svg width={16} height={16} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              {side==="left"?<polyline points="15 18 9 12 15 6"/>:<polyline points="9 18 15 12 9 6"/>}
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const OrderTimeline = ({order}) => {
    const ageMin=Math.floor((Date.now()-order.createdAt)/60000);
    const simIdx=Math.min(ageMin<2?0:ageMin<5?1:ageMin<10?2:3,ORDER_STATUSES.length-1);
    const curIdx=Math.max(ORDER_STATUSES.findIndex(s=>s.key===order.status),simIdx);
    return (
      <div style={{...card,padding:20,marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:18,display:"flex",alignItems:"center",gap:8}}><I n="truck" s={18} c={C.or}/>Suivi de livraison</div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:15,top:20,bottom:20,width:2,background:C.border,zIndex:0}}/>
          <div style={{position:"absolute",left:15,top:20,width:2,background:C.or,zIndex:1,height:`${(curIdx/(ORDER_STATUSES.length-1))*100}%`,transition:"height 1s ease",borderRadius:2}}/>
          {ORDER_STATUSES.map((s,i)=>{
            const done=i<=curIdx,current=i===curIdx;
            return (
              <div key={s.key} style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:i<ORDER_STATUSES.length-1?24:0,position:"relative",zIndex:2}}>
                <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,background:done?C.or:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:done?16:12,transition:"all .4s",boxShadow:current?`0 0 0 4px ${C.orL}`:"none"}}>
                  {done?s.icon:"○"}
                </div>
                <div style={{paddingTop:4}}>
                  <div style={{fontWeight:current?900:700,fontSize:14,color:done?C.dark:C.light}}>
                    {s.label}{current&&<span style={{marginLeft:8,fontSize:9,background:C.or,color:"#fff",padding:"2px 8px",borderRadius:20,fontWeight:800}}>EN COURS</span>}
                  </div>
                  <div style={{fontSize:11,color:C.light,marginTop:2}}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:18,padding:12,background:C.orL,borderRadius:12,fontSize:12,color:C.or,fontWeight:700,display:"flex",gap:8,alignItems:"center"}}>
          <span>📍</span><span>Livraison à : {order.address?.quartier}, {order.address?.ville||"Daloa"}</span>
        </div>
      </div>
    );const PageHome = () => (
    <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
      <HeroBanner/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[[products.length,"Produits","📦"],[new Set(products.map(p=>p.sellerId)).size,"Vendeurs","🏪"],["24h","Livraison","⚡"]].map(([v,l,e])=>(
          <div key={l} style={{...card,padding:"14px 8px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{e}</div>
            <div style={{fontWeight:900,fontSize:17,color:C.or}}>{v}</div>
            <div style={{fontSize:10,color:C.light,fontWeight:700}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>📂 Catégories</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Mode","👗"],["Alimentation","🥭"],["Électronique","📱"],["Beauté","💄"],["Maison","🏠"],["Voir tout","🔍"]].map(([c,e])=>(
            <div key={c} style={{...card,padding:"14px 8px",textAlign:"center",cursor:"pointer",border:`1.5px solid ${C.border}`}} onClick={()=>{setCategory(c==="Voir tout"?"Tous":c);setPage("shop");}}>
              <div style={{fontSize:26,marginBottom:5}}>{e}</div>
              <div style={{fontSize:11,fontWeight:800,color:C.mid}}>{c}</div>
            </div>
          ))}
        </div>
      </div>
      {products.filter(p=>p.badge==="Promo"||p.oldPrice).length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>⚡ Promotions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {products.filter(p=>p.badge==="Promo"||p.oldPrice).slice(0,4).map(p=><PCard key={p.id} p={p}/>)}
          </div>
        </div>
      )}
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>🌟 Populaires</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {products.slice(0,4).map(p=><PCard key={p.id} p={p}/>)}
        </div>
      </div>
      <div style={{background:C.dark,borderRadius:20,padding:"22px 20px",color:"#fff",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>🏪</div>
        <h3 style={{fontWeight:900,fontSize:17,margin:"0 0 6px"}}>Vendez sur Daloa Shop</h3>
        <p style={{color:"#aaa",fontSize:13,margin:"0 0 4px"}}>100% gratuit • Aucun abonnement</p>
        <p style={{color:C.or,fontSize:12,fontWeight:800,margin:"0 0 16px"}}>Seulement 10% sur vos ventes réalisées</p>
        <button style={btn()} onClick={()=>{setAuthMode("seller");setPage("auth");}}>
          <I n="store" s={15}/>Commencer à vendre
        </button>
      </div>
    </div>
  );

  const PageShop = () => (
    <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:12}}>🛍️ Boutique</div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16,scrollbarWidth:"none"}}>
        {CATS.map(c=><button key={c} style={{padding:"8px 16px",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",background:category===c?C.or:"#f0f0f0",color:category===c?"#fff":C.mid,border:"none",fontFamily:"inherit"}} onClick={()=>setCategory(c)}>{c}</button>)}
      </div>
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>🔍</div><div style={{fontWeight:700}}>Aucun produit trouvé</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {filtered.map(p=><PCard key={p.id} p={p}/>)}
        </div>
      )}
    </div>
  );

  const PageProduct = () => {
    const p=selectedProduct;
    if(!p||!p.name) return null;
    const wished=wishlist.includes(p.id);
    const related=products.filter(pp=>pp.sellerId===p.sellerId&&pp.id!==p.id).slice(0,4);
    return (
      <div style={{paddingBottom:100,maxWidth:700,margin:"0 auto"}}>
        <div style={{position:"relative"}}>
          <div style={{background:"linear-gradient(135deg,#FFF0E8,#ffdcc4)",minHeight:280,display:"flex",alignItems:"center",justifyContent:"center",fontSize:120}}>
            {p.img?<img src={p.img} alt={p.name} style={{width:"100%",maxHeight:320,objectFit:"cover"}}/>:p.emoji||"📦"}
          </div>
          <button style={{position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:12,width:42,height:42,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPage("shop")}><I n="back" s={20}/></button>
          <button style={{position:"absolute",top:14,right:14,background:wished?C.or:"rgba(255,255,255,0.9)",border:"none",borderRadius:12,width:42,height:42,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>toggleWishlist(p.id)}>
            <span style={{fontSize:20,color:wished?"#fff":C.or}}>{wished?"♥":"♡"}</span>
          </button>
        </div>
        <div style={{padding:"20px 16px"}}>
          {p.badge&&<span style={{background:p.badge==="Promo"?"#FF4500":"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{p.badge}</span>}
          <h2 style={{fontWeight:900,fontSize:22,margin:"10px 0 6px"}}>{p.name}</h2>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Stars r={p.rating}/><span style={{fontSize:12,color:C.light}}>{p.rating} ({p.reviews} avis)</span></div>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:16}}>
            <span style={{fontWeight:900,fontSize:28,color:C.or}}>{p.price.toLocaleString()} FCFA</span>
            {p.oldPrice&&<span style={{textDecoration:"line-through",color:"#ccc",fontSize:15}}>{p.oldPrice.toLocaleString()} F</span>}
          </div>
          {p.desc&&<p style={{fontSize:13,color:C.mid,lineHeight:1.6,marginBottom:16,background:"#f8f8f8",borderRadius:12,padding:14}}>{p.desc}</p>}
          <div style={{...card,padding:14,marginBottom:16,cursor:"pointer",border:`1.5px solid ${C.border}`}} onClick={()=>{setSelectedSeller({id:p.sellerId,name:p.seller});setPage("boutique");}}>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:C.light,fontWeight:700}}>VENDEUR</div>
                <div style={{fontWeight:800,fontSize:14,marginTop:2,color:C.or}}>{p.seller} →</div>
              </div>
              <div><div style={{fontSize:11,color:C.light,fontWeight:700}}>STOCK</div><div style={{fontWeight:800,fontSize:14,marginTop:2,color:p.stock<5?C.or:"#22c55e"}}>{p.stock}</div></div>
            </div>
          </div>
          <div style={{background:C.orL,borderRadius:12,padding:"11px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
            <I n="truck" s={16} c={C.or}/><span style={{fontSize:13,color:C.or,fontWeight:700}}>Livraison à Daloa sous 24h</span>
          </div>
          {p.stock===0?(
            <div style={{...btn("#ccc","#fff","14px"),width:"100%",cursor:"not-allowed",borderRadius:14}}>Rupture de stock</div>
          ):(
            <>
              <button style={{...btn(C.or,"#fff","14px"),width:"100%",borderRadius:14,fontSize:15}} onClick={()=>addToCart(p)}><I n="cart" s={17}/>Ajouter au panier</button>
              <button style={{...btn("#f0f0f0",C.dark,"13px"),width:"100%",borderRadius:14,marginTop:10}} onClick={()=>{addToCart(p);setPage("cart");}}>Commander maintenant</button>
            </>
          )}
          {related.length>0&&(
            <div style={{marginTop:24}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>🏪 Plus de {p.seller}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>{related.map(sp=><PCard key={sp.id} p={sp}/>)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PageBoutique = () => {
    if(!selectedSeller) return null;
    const sp=products.filter(p=>p.sellerId===selectedSeller.id);
    const avgR=sp.length?(sp.reduce((s,p)=>s+(p.rating||0),0)/sp.length).toFixed(1):"—";
    const totalRev=sp.reduce((s,p)=>s+(p.reviews||0),0);
    const colors=["#FF6B2B","#8B5CF6","#22c55e","#3B82F6","#F59E0B"];
    const avatarColor=colors[selectedSeller.id?.charCodeAt(selectedSeller.id.length-1)%colors.length]||C.or;
    return (
      <div style={{paddingBottom:100,maxWidth:700,margin:"0 auto"}}>
        <div style={{background:`linear-gradient(135deg,${avatarColor},${avatarColor}dd)`,padding:"28px 20px 20px",color:"#fff",position:"relative",overflow:"hidden"}}>
          <button style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPage("shop")}><I n="back" s={18} c="#fff"/></button>
          <div style={{position:"absolute",right:-30,top:-30,fontSize:120,opacity:.08}}>🏪</div>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:18,background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontWeight:900,border:"2px solid rgba(255,255,255,0.4)"}}>{selectedSeller.name?.[0]?.toUpperCase()||"🏪"}</div>
            <div><h2 style={{fontWeight:900,fontSize:20,margin:"0 0 4px"}}>{selectedSeller.name}</h2><div style={{fontSize:11,opacity:.85}}>✅ Vendeur vérifié • Daloa, Côte d'Ivoire</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[[sp.length,"Produits","📦"],[avgR,"Note moy.","⭐"],[totalRev,"Avis","💬"]].map(([v,l,e])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:10,opacity:.8,marginBottom:2}}>{e} {l}</div><div style={{fontWeight:900,fontSize:18}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"16px 14px"}}>
          <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>🛍️ Produits de {selectedSeller.name}</div>
          {sp.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>📦</div><div style={{fontWeight:700}}>Aucun produit</div></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>{sp.map(p=><PCard key={p.id} p={p}/>)}</div>}
        </div>
      </div>
    );
  };const PageCart = () => (
    <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:16}}>🛒 Mon Panier {cartCount>0&&`(${cartCount})`}</div>
      {cart.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:64,marginBottom:16}}>🛒</div><p style={{color:C.light,fontWeight:700,marginBottom:20}}>Panier vide</p><button style={btn()} onClick={()=>setPage("shop")}>Commencer mes achats</button></div>
      ):(
        <>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {cart.map(item=>(
              <div key={item.id} style={{...card,padding:13,display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                  {item.img?<img src={item.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji||"📦"}
                </div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{item.name}</div><div style={{fontWeight:900,color:C.or,fontSize:14,marginTop:3}}>{(item.price*item.qty).toLocaleString()} FCFA</div></div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button style={{width:28,height:28,border:`1.5px solid ${C.border}`,borderRadius:8,cursor:"pointer",background:"#f5f5f5",fontWeight:800,fontSize:15,fontFamily:"inherit"}} onClick={()=>updateQty(item.id,-1)}>−</button>
                  <span style={{fontWeight:800,minWidth:22,textAlign:"center"}}>{item.qty}</span>
                  <button style={{width:28,height:28,border:"none",borderRadius:8,cursor:"pointer",background:C.or,color:"#fff",fontWeight:800,fontSize:15,fontFamily:"inherit"}} onClick={()=>updateQty(item.id,1)}>+</button>
                </div>
                <button style={{border:"none",background:"none",cursor:"pointer",color:"#FF4500",padding:4}} onClick={()=>removeFromCart(item.id)}><I n="trash" s={17}/></button>
              </div>
            ))}
          </div>
          <div style={{...card,padding:20}}>
            {[["Sous-total",`${cartTotal.toLocaleString()} FCFA`],["Livraison","Gratuite 🎉"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.mid,marginBottom:8}}><span>{l}</span><span style={{color:v.includes("Grat")?"#22c55e":undefined}}>{v}</span></div>
            ))}
            <div style={{borderTop:`1.5px dashed ${C.border}`,paddingTop:12,marginTop:4,display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:18}}>
              <span>Total</span><span style={{color:C.or}}>{cartTotal.toLocaleString()} FCFA</span>
            </div>
            <div style={{marginTop:10,fontSize:11,color:C.light,textAlign:"center"}}>💡 Codes promo : <strong style={{color:C.or}}>DALOA10</strong> • <strong style={{color:C.or}}>BIENVENUE</strong></div>
            <button style={{...btn(C.or,"#fff","14px"),width:"100%",borderRadius:14,fontSize:15,marginTop:12}}
              onClick={()=>{if(!user){setPage("auth");showToast("Connectez-vous pour commander","error");return;}setPage("checkout");}}>
              <I n="truck" s={17}/>Commander ({cartTotal.toLocaleString()} F)
            </button>
          </div>
        </>
      )}
    </div>
  );

  const PageCheckout = () => {
    const steps=["Adresse","Livraison","Paiement"];
    return (
      <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
        <button style={{background:"none",border:"none",cursor:"pointer",color:C.or,fontWeight:800,marginBottom:16,display:"flex",alignItems:"center",gap:4,fontFamily:"inherit",fontSize:14}} onClick={()=>setPage("cart")}><I n="back" s={16}/>Retour</button>
        <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
          {steps.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:i+1<=checkStep?C.or:"#e8e8e8",color:i+1<=checkStep?"#fff":"#bbb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13}}>
                  {i+1<checkStep?<I n="check" s={14} c="#fff"/>:i+1}
                </div>
                <span style={{fontSize:9,fontWeight:800,color:i+1<=checkStep?C.or:C.light}}>{s}</span>
              </div>
              {i<steps.length-1&&<div style={{flex:1,height:2,background:i+1<checkStep?C.or:"#e8e8e8",margin:"0 4px",marginBottom:16}}/>}
            </div>
          ))}
        </div>
        {checkStep===1&&(
          <div style={{...card,padding:20}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>📍 Adresse de livraison</div>
            {[["name","Nom complet *","Jean Kouadio"],["phone","Téléphone *","07 00 00 00 00"],["quartier","Quartier / Rue *","Km5, Résidence les palmiers"],["ville","Ville","Daloa"],["notes","Instructions","Maison bleue, 2ème portail"]].map(([k,l,pl])=>(
              <div key={k} style={{marginBottom:12}}><label style={lbl}>{l}</label><input style={inp} value={checkForm[k]||""} onChange={e=>setCheckForm(f=>({...f,[k]:e.target.value}))} placeholder={pl}/></div>
            ))}
            <button style={{...btn(C.or,"#fff","14px"),width:"100%",borderRadius:14}} onClick={()=>{if(!checkForm.name||!checkForm.phone||!checkForm.quartier){showToast("Champs obligatoires manquants","error");return;}setCheckStep(2);}}>Continuer →</button>
          </div>
        )}
        {checkStep===2&&(
          <div style={{...card,padding:20}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>🚚 Livraison</div>
            {[["standard","Livraison standard","24-48h","Gratuite"],["express","Livraison express","2-4h","500 FCFA"],["pickup","Retrait boutique","À convenir","Gratuit"]].map(([v,l,t,p])=>(
              <div key={v} style={{border:`2px solid ${checkForm.delivery===v?C.or:C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,cursor:"pointer"}} onClick={()=>setCheckForm(f=>({...f,delivery:v}))}>
                <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:800,fontSize:14}}>{l}</div><div style={{fontSize:12,color:C.light,marginTop:2}}>{t}</div></div><div style={{fontWeight:900,color:"#22c55e"}}>{p}</div></div>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button style={{...btn("#f0f0f0",C.dark,"13px"),flex:1}} onClick={()=>setCheckStep(1)}>← Retour</button>
              <button style={{...btn(C.or,"#fff","13px"),flex:2}} onClick={()=>{if(!checkForm.delivery){showToast("Choisis une livraison","error");return;}setCheckStep(3);}}>Continuer →</button>
            </div>
          </div>
        )}
        {checkStep===3&&(
          <div>
            <div style={{...card,padding:16,marginBottom:12,border:`1.5px solid ${appliedPromo?"#22c55e":C.border}`}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><I n="ticket" s={16} c={appliedPromo?"#22c55e":C.or}/>Code promo</div>
              {appliedPromo?(
                <div style={{display:"flex",alignItems:"center",gap:10,background:"#f0fdf4",borderRadius:12,padding:"12px 14px"}}>
                  <span style={{fontSize:20}}>🎟️</span>
                  <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13,color:"#166534"}}>{appliedPromo.code}</div><div style={{fontSize:11,color:"#15803d"}}>{appliedPromo.label}</div></div>
                  <div style={{fontWeight:900,fontSize:14,color:"#22c55e"}}>-{discountAmount.toLocaleString()} F</div>
                  <button style={{background:"none",border:"none",cursor:"pointer",color:"#999",fontSize:18}} onClick={()=>{setAppliedPromo(null);setPromoCode("");}}>×</button>
                </div>
              ):(
                <div style={{display:"flex",gap:8}}>
                  <input style={{...inp,flex:1,textTransform:"uppercase"}} placeholder="Ex: DALOA10" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&applyPromo()}/>
                  <button style={{...btn(C.or,"#fff","12px 18px"),borderRadius:11}} onClick={applyPromo}>Appliquer</button>
                </div>
              )}
            </div>
            <div style={{...card,padding:20,marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>💳 Paiement</div>
              {PAY_METHODS.map(pm=>(
                <div key={pm.id} style={{border:`2px solid ${payMethod===pm.id?C.or:C.border}`,borderRadius:14,padding:"13px 16px",marginBottom:10,cursor:"pointer"}} onClick={()=>setPayMethod(pm.id)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>{pm.icon}</span><span style={{fontWeight:800,fontSize:14}}>{pm.label}</span>
                    {payMethod===pm.id&&<span style={{marginLeft:"auto"}}><I n="check" s={16} c={C.or}/></span>}
                  </div>
                  {payMethod===pm.id&&pm.id!=="cash"&&(
                    <div style={{marginTop:10}}><input style={inp} placeholder="Numéro Mobile Money" value={checkForm.momoPhone||""} onChange={e=>setCheckForm(f=>({...f,momoPhone:e.target.value}))}/></div>
                  )}
                </div>
              ))}
            </div>
            <div style={{...card,padding:16,marginBottom:16}}>
              <div style={{fontWeight:800,marginBottom:12}}>📋 Récapitulatif</div>
              {cart.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{color:C.mid}}>{item.name} ×{item.qty}</span><span style={{fontWeight:700}}>{(item.price*item.qty).toLocaleString()} F</span></div>
              ))}
              {discountAmount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"#22c55e"}}><span>🎟️ {appliedPromo?.code}</span><span style={{fontWeight:800}}>-{discountAmount.toLocaleString()} F</span></div>}
              <div style={{borderTop:`1.5px dashed ${C.border}`,paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:16}}>
                <span>Total</span><span style={{color:C.or}}>{finalTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={{...btn("#f0f0f0",C.dark,"13px"),flex:1}} onClick={()=>setCheckStep(2)}>← Retour</button>
              <button style={{...btn(C.or,"#fff","13px"),flex:2,opacity:processingPay?.5:1}} onClick={()=>{if(payMethod!=="cash"&&!checkForm.momoPhone){showToast("Entre ton numéro Mobile Money","error");return;}placeOrder();}} disabled={processingPay}>
                {processingPay?"⏳ Traitement...":`✅ Payer ${finalTotal.toLocaleString()} F`}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  };
);const PageOrderConfirm = () => {
    const o=selectedProduct;
    return (
      <div style={{padding:"40px 20px 100px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:80,marginBottom:16,animation:"bounceIn .6s"}}>🎉</div>
        <h2 style={{fontWeight:900,fontSize:22,margin:"0 0 8px"}}>Commande confirmée !</h2>
        <p style={{color:C.light,marginBottom:20,fontSize:14}}>Numéro : <strong style={{color:C.or}}>#{o?.id}</strong></p>
        {o&&<OrderTimeline order={o}/>}
        <div style={{...card,padding:20,textAlign:"left",marginBottom:16}}>
          {o?.items?.map(item=>(<div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:C.mid}}><span>{item.name} ×{item.qty}</span><span style={{fontWeight:700,color:C.dark}}>{(item.price*item.qty).toLocaleString()} F</span></div>))}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:900}}>
            <span>Total payé</span><span style={{color:C.or}}>{o?.total?.toLocaleString()} FCFA</span>
          </div>
        </div>
        <button style={{...btn(C.or,"#fff","14px"),width:"100%",borderRadius:14,marginBottom:10}} onClick={()=>setPage("orders")}><I n="box" s={16}/>Suivre mes commandes</button>
        <button style={{...btn("#f0f0f0",C.dark,"13px"),width:"100%",borderRadius:14}} onClick={()=>setPage("home")}>Retour à l'accueil</button>
      </div>
    );
  };

  const PageOrders = () => (
    <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:16}}>📦 Mes Commandes</div>
      {!user?(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>🔐</div><p style={{color:C.light,marginBottom:20}}>Connectez-vous</p><button style={btn()} onClick={()=>setPage("auth")}>Se connecter</button></div>)
      :myOrders.length===0?(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:64,marginBottom:16}}>📦</div><p style={{color:C.light,fontWeight:700,marginBottom:20}}>Aucune commande</p><button style={btn()} onClick={()=>setPage("shop")}>Faire mes achats</button></div>)
      :(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {myOrders.map(order=>(
            <div key={order.id}>
              <div style={{...card,padding:16,cursor:"pointer"}} onClick={()=>setSelectedOrder(selectedOrder?.id===order.id?null:order)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontWeight:900,fontSize:14}}>#{order.id}</span>
                  <span style={{background:"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{ORDER_STATUSES.find(s=>s.key===order.status)?.label||order.status}</span>
                </div>
                <div style={{fontSize:12,color:C.light,marginBottom:8}}>{order.date} • {order.items?.length} article(s)</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.mid}}>📍 {order.address?.quartier}</span>
                  <span style={{fontWeight:900,color:C.or}}>{order.total?.toLocaleString()} FCFA</span>
                </div>
                <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.or,fontWeight:700}}>{selectedOrder?.id===order.id?"▲ Masquer":"▼ Voir le suivi"}</div>
              </div>
              {selectedOrder?.id===order.id&&<div style={{padding:"0 4px"}}><OrderTimeline order={order}/></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PageAuth = () => {
    const isSell=authMode==="seller";
    return (
      <div style={{padding:"16px 14px 100px",maxWidth:440,margin:"0 auto"}}>
        <div style={{display:"flex",background:"#f0f0f0",borderRadius:13,padding:4,marginBottom:20}}>
          {[["login","Connexion"],["register","S'inscrire"],["seller","Vendre"]].map(([m,l])=>(
            <button key={m} style={{flex:1,padding:"9px 4px",border:"none",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:12,background:authMode===m?C.or:"transparent",color:authMode===m?"#fff":C.mid,fontFamily:"inherit"}} onClick={()=>setAuthMode(m)}>{l}</button>
          ))}
        </div>
        <div style={{...card,padding:24}}>
          <h2 style={{fontWeight:900,fontSize:20,margin:"0 0 4px"}}>{isSell?"Devenir vendeur":authMode==="login"?"Bon retour !":"Créer un compte"}</h2>
          {isSell&&<p style={{color:C.or,fontSize:12,fontWeight:700,margin:"0 0 16px"}}>✅ Accès gratuit • 10% sur vos ventes uniquement</p>}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
            {[["google","Google","#fff",`1.5px solid ${C.border}`,C.dark],["facebook","Facebook","#1877F2","none","#fff"]].map(([p,l,bg,border,col])=>(
              <button key={p} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:12,border,borderRadius:12,cursor:"pointer",background:bg,fontWeight:800,fontSize:14,fontFamily:"inherit",color:col}} onClick={()=>handleSocialLogin(p,isSell?"seller":"buyer")} disabled={authLoading}>
                {authLoading?"⏳ Connexion…":`Continuer avec ${l}`}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.light,fontWeight:700}}>OU</span><div style={{flex:1,height:1,background:C.border}}/></div>
          {authMode!=="login"&&<div style={{marginBottom:12}}><label style={lbl}>{isSell?"Nom de ta boutique":"Ton nom"}</label><input style={inp} value={authForm.name||""} onChange={e=>setAuthForm(f=>({...f,name:e.target.value}))} placeholder={isSell?"Boutique Awa":"Jean Kouadio"}/></div>}
          <div style={{marginBottom:12}}><label style={lbl}>Email</label><input style={inp} type="email" value={authForm.email||""} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))} placeholder="toi@gmail.com"/></div>
          <div style={{marginBottom:16}}><label style={lbl}>Mot de passe</label><input style={inp} type="password" value={authForm.password||""} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))} placeholder="••••••••"/></div>
          {isSell&&(
            <div style={{background:C.orL,borderRadius:12,padding:12,marginBottom:16,fontSize:12,color:C.or,fontWeight:700,lineHeight:1.8}}>
              ✅ Accès immédiat et gratuit<br/>✅ Produits illimités<br/>✅ Commission 10% sur ventes seulement<br/>✅ Aucun abonnement
            </div>
          )}
          <button style={{...btn(C.or,"#fff","14px"),width:"100%",borderRadius:14,fontSize:15,opacity:authLoading?.6:1}} onClick={handleEmailAuth} disabled={authLoading}>
            {authLoading?"⏳…":isSell?"Commencer à vendre":authMode==="login"?"Se connecter":"Créer mon compte"}
          </button>
          <div style={{marginTop:14,fontSize:10,color:C.light,textAlign:"center"}}>🔐 Admin : admin@daloashop.ci / admin123</div>
        </div>
      </div>
    );
  };const PageProfile = () => !user?(
    <div style={{padding:"60px 20px",textAlign:"center"}}><div style={{fontSize:64,marginBottom:16}}>👤</div><button style={btn()} onClick={()=>setPage("auth")}>Se connecter</button></div>
  ):(
    <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
      <div style={{background:`linear-gradient(135deg,${C.or},#e85a1f)`,borderRadius:20,padding:24,color:"#fff",marginBottom:20,textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.25)",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900}}>{user.avatar}</div>
        <h3 style={{fontWeight:900,margin:"0 0 4px",fontSize:20}}>{user.name}</h3>
        <p style={{opacity:.85,margin:"0 0 8px",fontSize:13}}>{user.email}</p>
        <span style={{background:"rgba(255,255,255,0.25)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{user.type==="seller"?"🏪 Vendeur":"🛒 Acheteur"}</span>
      </div>
      <div style={{...card,overflow:"hidden"}}>
        {[
          {icon:"box",label:`Mes commandes (${myOrders.length})`,action:()=>setPage("orders")},
          {icon:"bell",label:`Notifications${unreadSeller>0?` (${unreadSeller})` :""}`,action:()=>{setShowNotifPanel(true);markRead("seller");}},
          ...(isSeller?[{icon:"store",label:"Dashboard vendeur",action:()=>setPage("seller")}]:[]),
          {icon:"shield",label:"Sécurité",action:()=>{}},
        ].map(({icon,label,action})=>(
          <button key={label} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",border:"none",background:"none",width:"100%",cursor:"pointer",borderBottom:`1px solid ${C.border}`,fontFamily:"inherit",textAlign:"left"}} onClick={action}>
            <I n={icon} s={18} c={C.or}/><span style={{flex:1,fontWeight:700,fontSize:14}}>{label}</span><span style={{color:"#ccc",fontSize:20}}>›</span>
          </button>
        ))}
        <button style={{display:"flex",alignItems:"center",gap:14,padding:"16px",border:"none",background:"none",width:"100%",cursor:"pointer",fontFamily:"inherit"}} onClick={logout}>
          <I n="logout" s={18} c="#FF4500"/><span style={{fontWeight:800,fontSize:14,color:"#FF4500"}}>Se déconnecter</span>
        </button>
      </div>
    </div>
  );

  const PageAdmin = () => {
    const totalCommission=orders.reduce((s,o)=>s+(o.commission||0),0);
    const totalCA=orders.reduce((s,o)=>s+(o.total||0),0);
    return (
      <div style={{padding:"16px 14px 40px",maxWidth:700,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",borderRadius:20,padding:20,color:"#fff",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><div style={{fontSize:11,opacity:.6,marginBottom:4}}>TABLEAU DE BORD</div><h2 style={{fontWeight:900,fontSize:20,margin:0}}>🏪 Daloa Shop Admin</h2></div>
            <span style={{background:C.or,color:"#fff",fontSize:9,fontWeight:900,padding:"4px 12px",borderRadius:20}}>ADMIN</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[[orders.length,"Commandes","📦"],[`${totalCommission.toLocaleString()} F`,"Commissions","💰"],[`${totalCA.toLocaleString()} F`,"Chiffre d'aff.","📈"]].map(([v,l,e])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:4}}>{e}</div><div style={{fontWeight:900,fontSize:13}}>{v}</div><div style={{fontSize:9,opacity:.6,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["notifs","🔔 Notifs"],["orders","📦 Commandes"],["sellers","🏪 Vendeurs"]].map(([t,l])=>(
            <button key={t} style={{padding:"9px 16px",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",background:adminTab===t?C.or:"#f0f0f0",color:adminTab===t?"#fff":C.mid,border:"none",fontFamily:"inherit"}} onClick={()=>setAdminTab(t)}>
              {l}{t==="notifs"&&unreadAdmin>0?` (${unreadAdmin})`:""}
            </button>
          ))}
        </div>
        {adminTab==="notifs"&&(
          <div>
            {adminNotifs.length===0?(
              <div style={{textAlign:"center",padding:"50px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>🔕</div><div style={{fontWeight:700}}>Aucune notification</div></div>
            ):adminNotifs.map(n=>(
              <div key={n.id} style={{...card,padding:16,marginBottom:10,border:`1.5px solid ${n.read?"#f0f0f0":"#FFD4B8"}`}}>
                <div style={{fontWeight:800,fontSize:13,marginBottom:4}}>{n.title}</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,whiteSpace:"pre-line",marginBottom:10}}>{n.message}</div>
                <div style={{fontSize:10,color:C.light,marginBottom:8}}>{n.time}</div>
                {n.contacts&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <a href={`tel:${n.contacts.clientPhone}`} style={{background:"#22c55e",color:"#fff",fontSize:11,fontWeight:800,padding:"7px 14px",borderRadius:20,textDecoration:"none"}}>📞 Client</a>
                    <a href={`tel:${n.contacts.sellerPhone}`} style={{background:C.or,color:"#fff",fontSize:11,fontWeight:800,padding:"7px 14px",borderRadius:20,textDecoration:"none"}}>🏪 Vendeur</a>
                    <a href={`https://wa.me/${n.contacts.clientPhone?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{background:"#25D366",color:"#fff",fontSize:11,fontWeight:800,padding:"7px 14px",borderRadius:20,textDecoration:"none"}}>💬 WhatsApp</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {adminTab==="orders"&&(
          <div>
            {orders.length===0?<div style={{textAlign:"center",padding:"50px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>📦</div><div style={{fontWeight:700}}>Aucune commande</div></div>
            :orders.map(o=>(
              <div key={o.id} style={{...card,padding:16,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:900}}>#{o.id}</span><span style={{background:"#22c55e",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{ORDER_STATUSES.find(s=>s.key===o.status)?.label}</span></div>
                <div style={{fontSize:12,color:C.light,marginBottom:8}}>{o.date} • {o.buyerName} • {o.address?.phone||"—"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                  {[["Total client",`${o.total?.toLocaleString()} F`,C.dark],["Commission",`${o.commission?.toLocaleString()||0} F`,C.or],["Net vendeur",`${o.netSeller?.toLocaleString()||0} F`,"#22c55e"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#f9f9f9",borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:9,color:C.light,fontWeight:700}}>{l}</div><div style={{fontWeight:900,fontSize:11,color:c,marginTop:2}}>{v}</div></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href={`tel:${o.address?.phone}`} style={{background:"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"6px 12px",borderRadius:16,textDecoration:"none"}}>📞 Client</a>
                  <a href={`https://wa.me/${o.address?.phone?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{background:"#25D366",color:"#fff",fontSize:10,fontWeight:800,padding:"6px 12px",borderRadius:16,textDecoration:"none"}}>💬 WA Client</a>
                </div>
              </div>
            ))}
          </div>
        )}
        {adminTab==="sellers"&&(
          <div>
            {Array.from(new Map(products.map(p=>[p.sellerId,{id:p.sellerId,name:p.seller}])).values()).map(s=>{
              const sp=products.filter(p=>p.sellerId===s.id);
              const so=orders.filter(o=>o.items.some(i=>i.sellerId===s.id));
              const rev=so.reduce((sum,o)=>sum+(o.netSeller||0),0);
              const comm=so.reduce((sum,o)=>sum+(o.commission||0),0);
              return (
                <div key={s.id} style={{...card,padding:16,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{width:42,height:42,borderRadius:12,background:C.or,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18}}>{s.name?.[0]}</div>
                    <div><div style={{fontWeight:800,fontSize:14}}>{s.name}</div><div style={{fontSize:11,color:C.light}}>{sp.length} produit(s) • {so.length} commande(s)</div></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[["Revenus vendeur",`${rev.toLocaleString()} F`,"#22c55e"],["Commission Daloa",`${comm.toLocaleString()} F`,C.or]].map(([l,v,c])=>(
                      <div key={l} style={{background:"#f9f9f9",borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:9,color:C.light,fontWeight:700}}>{l}</div><div style={{fontWeight:900,fontSize:12,color:c,marginTop:2}}>{v}</div></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{marginTop:20}}><button style={{...btn("#f0f0f0",C.mid),width:"100%",borderRadius:14}} onClick={logout}><I n="logout" s={16} c={C.mid}/>Déconnexion admin</button></div>
      </div>
    );const ImgPickerField = ({value,onChange,inputRef}) => (
    <div style={{marginBottom:16}}>
      <label style={lbl}>📸 Photo du produit</label>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",background:C.orL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1.5px dashed ${C.or}`}}>
          {value?<img src={value} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>📷</span>}
        </div>
        <div style={{flex:1}}>
          <button style={{background:C.orL,color:C.or,border:`1.5px dashed ${C.or}`,borderRadius:10,padding:"10px 16px",width:"100%",cursor:"pointer",fontWeight:800,fontFamily:"inherit",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:7}} onClick={()=>inputRef.current?.click()} disabled={uploadingImg}>
            <I n="upload" s={14} c={C.or}/>{uploadingImg?"Chargement…":"Choisir une photo"}
          </button>
          <div style={{fontSize:10,color:C.light}}>JPG, PNG • Max 3 Mo</div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImageFile(e.target.files[0],url=>onChange(url))}/>
    </div>
  );

  const ProductForm = ({form,setForm,onSubmit,isEdit,imgRef}) => (
    <div style={{...card,padding:20}}>
      <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>{isEdit?"✏️ Modifier":"➕ Ajouter un produit"}</div>
      <ImgPickerField value={form.img} onChange={url=>setForm(f=>({...f,img:url}))} inputRef={imgRef}/>
      <div style={{marginBottom:12}}><label style={lbl}>Emoji</label><input style={{...inp,fontSize:24,textAlign:"center",padding:"8px"}} value={form.emoji||""} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} maxLength={2}/></div>
      {[["name","Nom du produit *","Ex: Pagne wax 6 yards"],["price","Prix (FCFA) *","Ex: 4500"],["stock","Stock","Ex: 20"]].map(([k,l,pl])=>(
        <div key={k} style={{marginBottom:12}}><label style={lbl}>{l}</label><input style={inp} type={k!=="name"?"number":"text"} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={pl}/></div>
      ))}
      <div style={{marginBottom:12}}><label style={lbl}>Catégorie</label><select style={inp} value={form.category||"Mode"} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.filter(c=>c!=="Tous").map(c=><option key={c}>{c}</option>)}</select></div>
      <div style={{marginBottom:16}}><label style={lbl}>Description</label><textarea style={{...inp,height:80,resize:"vertical"}} value={form.desc||""} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Décris ton produit…"/></div>
      {form.price&&(
        <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12,padding:12,marginBottom:16,fontSize:12}}>
          <div style={{fontWeight:800,color:"#166534",marginBottom:4}}>💰 Estimation revenus</div>
          <div style={{color:"#15803d"}}>Prix : <strong>{parseFloat(form.price||0).toLocaleString()} FCFA</strong></div>
          <div style={{color:"#15803d"}}>Commission Daloa (10%) : <strong>-{Math.round(parseFloat(form.price||0)*0.1).toLocaleString()} F</strong></div>
          <div style={{color:"#166534",fontWeight:900,marginTop:4}}>Vous recevrez : {Math.round(parseFloat(form.price||0)*0.9).toLocaleString()} FCFA</div>
        </div>
      )}
      <div style={{display:"flex",gap:10}}>
        {isEdit&&<button style={{...btn("#f0f0f0",C.dark,"13px"),flex:1}} onClick={()=>setEditingProduct(null)}>Annuler</button>}
        <button style={{...btn(C.or,"#fff","13px"),flex:2}} onClick={()=>onSubmit(form,isEdit)}><I n="check" s={15} c="#fff"/>{isEdit?"Enregistrer":"Publier"}</button>
      </div>
    </div>
  );

  const PageSeller = () => {
    if(!user||user.type!=="seller") return (
      <div style={{padding:"40px 20px",textAlign:"center"}}><div style={{fontSize:64,marginBottom:16}}>🔐</div><p style={{color:C.light,marginBottom:20}}>Accès réservé aux vendeurs</p><button style={btn()} onClick={()=>{setAuthMode("seller");setPage("auth");}}>Créer un compte vendeur</button></div>
    );
    const sellerRevenue=mySellerOrders.reduce((s,o)=>s+(o.netSeller||0),0);
    const sellerCommission=mySellerOrders.reduce((s,o)=>s+(o.commission||0),0);
    return (
      <div style={{padding:"16px 14px 100px",maxWidth:700,margin:"0 auto"}}>
        <div style={{background:`linear-gradient(135deg,${C.dark},#333)`,borderRadius:20,padding:20,color:"#fff",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><div style={{fontSize:11,opacity:.7,marginBottom:4}}>DASHBOARD</div><h2 style={{fontWeight:900,fontSize:18,margin:0}}>{user.name}</h2></div>
            {unreadSeller>0&&<span style={{background:"#FF4500",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20}}>{unreadSeller} nouvelle{unreadSeller>1?"s":""}</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[[mySellerProds.length,"Produits","📦"],[mySellerOrders.length,"Commandes","🛒"],[`${sellerRevenue.toLocaleString()} F`,"Revenus nets","💰"]].map(([v,l,e])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:3}}>{e}</div><div style={{fontWeight:900,fontSize:12}}>{v}</div><div style={{fontSize:9,opacity:.7,marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,background:"rgba(255,107,43,0.15)",borderRadius:12,padding:"10px 12px",fontSize:11,display:"flex",justifyContent:"space-between"}}>
            <span style={{opacity:.8}}>Commission Daloa Shop versée</span>
            <span style={{fontWeight:900,color:C.or}}>{sellerCommission.toLocaleString()} FCFA (10%)</span>
          </div>
        </div>
        {unreadSeller>0&&(
          <button style={{background:C.orL,color:C.or,border:`1.5px solid ${C.or}`,borderRadius:14,padding:"12px 20px",width:"100%",cursor:"pointer",fontWeight:800,fontFamily:"inherit",marginBottom:12,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
            onClick={()=>{setShowNotifPanel(true);markRead("seller");}}>
            <I n="bell" s={16} c={C.or}/>🔔 {unreadSeller} nouvelle{unreadSeller>1?"s":""} commande{unreadSeller>1?"s":""} — Voir
          </button>
        )}
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["products","Produits"],["add","Ajouter"],["orders","Commandes"],["stock","Stock"]].map(([t,l])=>(
            <button key={t} style={{padding:"8px 14px",borderRadius:20,fontWeight:800,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",background:sellerTab===t?C.or:"#f0f0f0",color:sellerTab===t?"#fff":C.mid,border:"none",fontFamily:"inherit"}} onClick={()=>{setSellerTab(t);setEditingProduct(null);}}>
              {l}{t==="orders"&&mySellerOrders.length>0?` (${mySellerOrders.length})`:""}
            </button>
          ))}
        </div>
        {sellerTab==="products"&&(
          mySellerProds.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>📦</div><div style={{fontWeight:700,marginBottom:16}}>Aucun produit</div><button style={btn()} onClick={()=>setSellerTab("add")}>Ajouter</button></div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mySellerProds.map(p=>(
                <div key={p.id} style={{...card,padding:14,display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                    {p.img?<img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:p.emoji||"📦"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                    <div style={{color:C.or,fontWeight:800,fontSize:13}}>{p.price?.toLocaleString()} FCFA</div>
                    <div style={{fontSize:11,color:C.light}}>Vous recevrez : <strong style={{color:"#22c55e"}}>{Math.round(p.price*0.9).toLocaleString()} F</strong></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{background:C.orL,color:C.or,border:"none",borderRadius:9,padding:8,cursor:"pointer",display:"flex"}} onClick={()=>{setEditingProduct({...p,price:String(p.price),stock:String(p.stock)});setSellerTab("add");}}><I n="edit" s={15} c={C.or}/></button>
                    <button style={{background:"#fff2f0",color:"#FF4500",border:"1px solid #ffd0cc",borderRadius:9,padding:8,cursor:"pointer",display:"flex"}} onClick={()=>deleteProduct(p.id)}><I n="trash" s={15} c="#FF4500"/></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {sellerTab==="add"&&(editingProduct?<ProductForm form={editingProduct} setForm={setEditingProduct} onSubmit={submitProduct} isEdit imgRef={editImgRef}/>:<ProductForm form={addForm} setForm={setAddForm} onSubmit={submitProduct} isEdit={false} imgRef={imgInputRef}/>)}
        {sellerTab==="orders"&&(
          mySellerOrders.length===0?<div style={{textAlign:"center",padding:"50px 20px",color:C.light}}><div style={{fontSize:48,marginBottom:12}}>📭</div><div style={{fontWeight:700}}>Aucune commande</div></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mySellerOrders.map(o=>{
              const myItems=o.items.filter(i=>i.sellerId===user?.id);
              return (
                <div key={o.id} style={{...card,padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:900}}>#{o.id}</span><span style={{background:"#22c55e",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{ORDER_STATUSES.find(s=>s.key===o.status)?.label}</span></div>
                  <div style={{fontSize:12,color:C.light,marginBottom:8}}>{o.date} • {o.buyerName}</div>
                  {myItems.map(item=><div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.mid}}>{item.name} ×{item.qty}</span><span style={{fontWeight:700}}>{(item.price*item.qty).toLocaleString()} F</span></div>)}
                  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:C.light}}>📍 {o.address?.quartier}</span>
                    <span style={{fontWeight:900,color:"#22c55e"}}>{o.netSeller?.toLocaleString()} FCFA net</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {sellerTab==="stock"&&(
          <div style={{...card,padding:16}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>📊 Stocks</div>
            {mySellerProds.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{fontSize:24,width:36,textAlign:"center"}}>{p.img?<img src={p.img} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>:p.emoji||"📦"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{p.name}</div>
                  <div style={{background:"#f0f0f0",borderRadius:20,height:6,overflow:"hidden"}}><div style={{width:`${Math.min(100,(p.stock/50)*100)}%`,height:"100%",background:p.stock===0?"#ccc":p.stock<5?"#FF4500":p.stock<15?C.or:"#22c55e",borderRadius:20}}/></div>
                </div>
                <div style={{fontWeight:900,fontSize:14,minWidth:26,textAlign:"center",color:p.stock===0?"#ccc":p.stock<5?C.or:"#22c55e"}}>{p.stock}</div>
                <div style={{display:"flex",gap:4}}>
                  <button style={{width:30,height:30,border:`1.5px solid ${C.border}`,borderRadius:8,cursor:"pointer",background:"#f5f5f5",fontWeight:900,fontFamily:"inherit"}} onClick={()=>updateStock(p.id,-1)}>−</button>
                  <button style={{width:30,height:30,border:"none",borderRadius:8,cursor:"pointer",background:C.or,color:"#fff",fontWeight:900,fontFamily:"inherit"}} onClick={()=>updateStock(p.id,1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f7f7f7"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16,animation:"spin 1s linear infinite"}}>🛒</div>
        <div style={{fontWeight:800,color:"#FF6B2B",fontSize:16}}>Daloa Shop</div>
        <div style={{color:"#999",fontSize:13,marginTop:4}}>Chargement…</div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#f7f7f7",minHeight:"100vh",color:"#111",overflowX:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#FF6B2B;border-radius:10px;}
        @keyframes slideDown{from{opacity:0;transform:translate(-50%,-20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes slideLeft{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideUp{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
        @keyframes bounceIn{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bannerIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        input:focus,textarea:focus,select:focus{border-color:#FF6B2B!important;outline:none;}
        button{transition:all .15s;font-family:inherit;}
        button:active{transform:scale(.96);}
      `}</style>
      <Header/>
      {showNotifPanel&&(
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:4999}} onClick={()=>setShowNotifPanel(false)}/>
          <NotifPanel notifs={currentNotifs} onClose={()=>setShowNotifPanel(false)} onClear={()=>clearNotifs(isAdmin?"admin":"seller")} isAdmin={isAdmin}/>
        </>
      )}
      {popupNotif&&<NotifPopup notif={popupNotif} onClose={()=>setPopupNotif(null)}/>}
      {toast&&(
        <div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?"#FF4500":toast.type==="promo"?"#22c55e":"#1a1a1a",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",animation:"slideUp .3s ease",whiteSpace:"nowrap",maxWidth:"90vw"}}>
          <span style={{fontSize:16}}>{toast.type==="error"?"❌":toast.type==="promo"?"🎟️":"✅"}</span>
          {toast.msg}
          <button onClick={()=>setToast(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:"0 0 0 6px",fontSize:16}}>×</button>
        </div>
      )}
      <main>
        {page==="home"          && <PageHome/>}
        {page==="shop"          && <PageShop/>}
        {page==="product"       && <PageProduct/>}
        {page==="boutique"      && <PageBoutique/>}
        {page==="cart"          && <PageCart/>}
        {page==="checkout"      && <PageCheckout/>}
        {page==="order-confirm" && <PageOrderConfirm/>}
        {page==="auth"          && <PageAuth/>}
        {page==="orders"        && <PageOrders/>}
        {page==="profile"       && <PageProfile/>}
        {page==="seller"        && <PageSeller/>}
        {page==="admin"         && <PageAdmin/>}
      </main>
      <BottomNav/>
    </div>
  );
}
  };
