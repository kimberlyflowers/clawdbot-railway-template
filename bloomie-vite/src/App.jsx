import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════ */
function mk(d){return d?{bg:"#1a1a1a",sf:"#212121",cd:"#262626",ac:"#F4A261",a2:"#E76F8B",gr:"#34A853",gf:"#1a2b1a",tx:"#ececec",so:"#a0a0a0",fa:"#5c5c5c",ln:"#353535",bl:"#5B8FF9",pu:"#A78BFA",inp:"#212121",hv:"#2f2f2f"}:{bg:"#F7F8FA",sf:"#EDEEF2",cd:"#FFFFFF",ac:"#F4A261",a2:"#E76F8B",gr:"#34A853",gf:"#F0FAF0",tx:"#111827",so:"#6B7280",fa:"#D1D5DB",ln:"#E5E7EB",bl:"#3B6FD4",pu:"#7C3AED",inp:"#F4F5F7",hv:"#F0F1F3"}}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
/* ─── AGENT PHOTO ─── */
var JOHN_IMG="data:image/jpeg;base64,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";
var BLOOMIE_IMG="data:image/png;base64,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";

/* ─── AGENTS ─── */
var AGENTS=[
  {id:"sarah",nm:"Sarah Rodriguez",role:"Growth & Community Lead",img:null,grad:"linear-gradient(135deg,#E76F8B,#A78BFA)",status:"online"},
  {id:"johnathon",nm:"Johnathon",role:"AI Employee",img:JOHN_IMG,grad:"linear-gradient(135deg,#F4A261,#E76F8B)",status:"online"},
  {id:"maya",nm:"Maya",role:"Video Marketing Agent",img:null,grad:"linear-gradient(135deg,#5B8FF9,#34A853)",status:"idle"},
  {id:"bloomie",nm:"Bloomie",role:"Help & Support",img:BLOOMIE_IMG,grad:"linear-gradient(135deg,#F4A261,#E76F8B)",status:"online"}
];

/* ─── BUSINESSES & PROJECTS ─── */
var BIZ=[
  {id:"bloom",nm:"BLOOM",ic:"\u{1F338}",cl:"#E76F8B",pj:[
    {id:"bloomshield",nm:"BloomShield",ic:"\u{1F6E1}"},
    {id:"bloomvault",nm:"BloomVault Extension",ic:"\u{1F512}"},
    {id:"bloombot",nm:"BloomBot Dashboard",ic:"\u{1F916}"},
    {id:"marketing",nm:"Marketing & Growth",ic:"\u{1F4C8}"}
  ]},
  {id:"petal",nm:"Petal Core Beauty",ic:"\u{1F33A}",cl:"#F4A261",pj:[
    {id:"tiktok",nm:"TikTok Shop",ic:"\u{1F3AC}"},
    {id:"product",nm:"Product Line",ic:"\u2728"},
    {id:"influencer",nm:"Influencer Campaigns",ic:"\u{1F4F1}"}
  ]},
  {id:"openclaw",nm:"OpenClaw Services",ic:"\u{1F43E}",cl:"#5B8FF9",pj:[
    {id:"fiverr",nm:"Fiverr Marketplace",ic:"\u{1F4B0}"},
    {id:"maya",nm:"Maya Campaign",ic:"\u{1F3A5}"},
    {id:"dashboard",nm:"Client Dashboard",ic:"\u{1F4CA}"}
  ]}
];

var PJ=[
  {id:"school",ic:"\u{1F3EB}",nm:"The School",cl:"#F4A261",dn:12,tot:185,
    at:{nm:"Demographic Research",pct:60,tm:"12 min left",steps:[
      {t:"Pulling Census data for your area",d:true,tm:"8:01 AM"},
      {t:"Analyzing household income levels",d:true,tm:"8:04 AM"},
      {t:"Counting school-age children by zip code",d:true,tm:"8:07 AM"},
      {t:"Mapping competitor schools within 10 miles",d:false,a:true},
      {t:"Building charts and summary report",d:false}]},
    fin:[{t:"Mission Statement",tm:"Jan 28"},{t:"Vision Statement",tm:"Jan 30"},{t:"School Model Selection",tm:"Feb 1"}],
    nxt:["Market Research Report","Competitor Deep Dive","Stakeholder List"]},
  {id:"book",ic:"\u{1F4D6}",nm:"The Book",cl:"#E76F8B",dn:2,tot:18,
    at:{nm:"Chapter 2: Why Classical Education",pct:65,tm:"25 min left",steps:[
      {t:"Researching classical education history",d:true,tm:"7:30 AM"},
      {t:"Drafting Section 2.1 \u2014 Historical roots",d:true,tm:"7:42 AM"},
      {t:"Drafting Section 2.2 \u2014 Grammar, Logic, Rhetoric",d:true,tm:"7:55 AM"},
      {t:"Drafting Section 2.3 \u2014 Modern application",d:false,a:true},
      {t:"Drafting Section 2.4 \u2014 Underserved communities",d:false},
      {t:"Final review and polish",d:false}]},
    fin:[{t:"Book Outline & Structure",tm:"Feb 1"},{t:"Chapter 1: The Vision",tm:"Feb 2"}],
    nxt:["Chapter 3","Chapter 4","Book Cover Concepts"]},
  {id:"event",ic:"\u{1F3A4}",nm:"March 15 Event",cl:"#6C63FF",dn:2,tot:6,
    at:{nm:"Building the Landing Page",pct:75,tm:"4 min left",steps:[
      {t:"Designing the page layout",d:true,tm:"8:10 AM"},
      {t:"Writing the event description",d:true,tm:"8:13 AM"},
      {t:"Adding the Eventbrite RSVP button",d:true,tm:"8:16 AM"},
      {t:"Testing on mobile and publishing",d:false,a:true}]},
    fin:[{t:"Eventbrite Listing",tm:"Today"},{t:"Event Date Confirmed",tm:"Feb 1"}],
    nxt:["Graphics Package","Email Blast","VIP Invitations"]}
];

var DL=[
  {id:1,nm:"Mission Statement",tp:"doc",ic:"\u{1F4C4}",pj:"school",pji:"\u{1F3EB}",dt:"Jan 28",ds:"2025-01-28",pv:"A clear, compelling mission statement for the Youth Empowerment School.",ct:"The Youth Empowerment School exists to provide a rigorous, classical education that develops the whole person \u2014 mind, body, and spirit \u2014 for students in underserved communities.\n\nOur mission is rooted in the belief that every child, regardless of zip code, deserves access to the kind of education that cultivates critical thinking, eloquent communication, and moral character."},
  {id:2,nm:"Vision Statement",tp:"doc",ic:"\u{1F4C4}",pj:"school",pji:"\u{1F3EB}",dt:"Jan 30",ds:"2025-01-30",pv:"10-year goals and community impact targets.",ct:"By 2035, the Youth Empowerment School will be the premier classical education institution in the region, serving 500+ students across K-12, with a 95% graduation rate."},
  {id:3,nm:"School Model Comparison",tp:"spreadsheet",ic:"\u{1F4CA}",pj:"school",pji:"\u{1F3EB}",dt:"Feb 1",ds:"2025-02-01",pv:"Charter vs private vs hybrid \u2014 pros, cons, and costs.",ct:null},
  {id:4,nm:"Book Outline",tp:"doc",ic:"\u{1F4C4}",pj:"book",pji:"\u{1F4D6}",dt:"Feb 1",ds:"2025-02-01",pv:"Chapter-by-chapter outline with themes and research notes.",ct:"THE SCHOOL THAT SHOULDN'T EXIST\nBy Charles Rodriguez\n\nChapter 1: The Vision\nChapter 2: Why Classical Education\nChapter 3: The Community Need"},
  {id:5,nm:"Chapter 1: The Vision",tp:"doc",ic:"\u{1F4C4}",pj:"book",pji:"\u{1F4D6}",dt:"Feb 2",ds:"2025-02-02",pv:"3,200 words \u2014 Charles\u2019s personal story and the spark.",ct:"CHAPTER 1: THE VISION\n\nI didn\u2019t set out to start a school. Nobody does, really. You set out to solve a problem that keeps you up at night, and sometimes the solution is bigger than you expected."},
  {id:6,nm:"Eventbrite Listing",tp:"link",ic:"\u{1F517}",pj:"event",pji:"\u{1F3A4}",dt:"Feb 3",ds:"2025-02-03",pv:"Live Eventbrite page with RSVP tracking.",ct:null},
  {id:7,nm:"Venue Confirmation Email",tp:"email",ic:"\u2709\uFE0F",pj:"event",pji:"\u{1F3A4}",dt:"Feb 1",ds:"2025-02-01",pv:"Confirmation email to venue for March 15th.",ct:"To: events@communitycenter.org\nSubject: Confirming March 15th \u2014 YES Info Session\n\nHi Maria,\n\nThis confirms our reservation of the Main Hall for Saturday, March 15th, 10:00 AM - 12:30 PM."},
  {id:8,nm:"Community Survey",tp:"doc",ic:"\u{1F4C4}",pj:"school",pji:"\u{1F3EB}",dt:"Jan 25",ds:"2025-01-25",pv:"20-question community needs assessment.",ct:null},
  {id:9,nm:"Board Member Profiles",tp:"doc",ic:"\u{1F4CB}",pj:"school",pji:"\u{1F3EB}",dt:"Jan 22",ds:"2025-01-22",pv:"8 potential board members with contact info.",ct:null},
  {id:10,nm:"Brand Guide",tp:"design",ic:"\u{1F3A8}",pj:"school",pji:"\u{1F3EB}",dt:"Jan 20",ds:"2025-01-20",pv:"Colors, fonts, and usage rules for YES materials.",ct:null}
];

var SS=[
  {id:"s1",tl:"Landing page and event graphics",tm:"Today"},
  {id:"s2",tl:"Book Chapter 1 review",tm:"Today"},
  {id:"s3",tl:"Eventbrite setup and logistics",tm:"Yesterday"},
  {id:"s4",tl:"School model comparison research",tm:"Yesterday"},
  {id:"s5",tl:"Mission statement drafting",tm:"Jan 28"},
  {id:"s6",tl:"Board member research",tm:"Jan 22"}
];

var TIPS=[
  {ic:"\u{1F3AF}",t:"A grant window opens March 1st \u2014 want me to start the application?"},
  {ic:"\u{1F4E7}",t:"Patricia hasn\u2019t replied in 4 days. Should I follow up?"},
  {ic:"\u2728",t:"Research finishes today. Start the next report automatically?"}
];

var CRONS=[
  {id:"c1",nm:"TikTok trend scan",ic:"\u{1F50D}",freq:"Every 6hrs",next:"2:30 PM",last:"8:32 AM",ok:true,on:true},
  {id:"c2",nm:"Daily email digest",ic:"\u{1F4E7}",freq:"Daily 6pm",next:"6:00 PM",last:"Yesterday 6pm",ok:true,on:true},
  {id:"c3",nm:"Competitor price check",ic:"\u{1F4CA}",freq:"Mon 9am",next:"Mon Feb 10",last:"Mon Feb 3",ok:false,on:true},
  {id:"c4",nm:"BloomShield backup",ic:"\u{1F6E1}",freq:"Every 12hrs",next:"11:00 PM",last:"11:02 AM",ok:true,on:true},
  {id:"c5",nm:"Social post scheduler",ic:"\u{1F4F1}",freq:"Daily 10am, 2pm, 7pm",next:"2:00 PM",last:"10:01 AM",ok:true,on:true},
  {id:"c6",nm:"Lead nurture drip",ic:"\u{1F4A7}",freq:"Every 48hrs",next:"Tomorrow 9am",last:"Yesterday 9am",ok:true,on:false}
];

var DNAV=[
  {s:"Control",it:[{ic:"\u{1F4CA}",l:"Overview"},{ic:"\u{1F517}",l:"Channels"},{ic:"\u{1F4E1}",l:"Instances"},{ic:"\u{1F4AC}",l:"Sessions"},{ic:"\u23F1",l:"Cron Jobs"}]},
  {s:"Agent",it:[{ic:"\u26A1",l:"Skills"},{ic:"\u{1F9E9}",l:"Nodes"}]},
  {s:"Settings",it:[{ic:"\u2699\uFE0F",l:"Config"},{ic:"\u{1F527}",l:"Debug"},{ic:"\u{1F4CB}",l:"Logs"}]},
  {s:"Resources",it:[{ic:"\u{1F4D6}",l:"Docs"}]}
];

var PLUS=[
  {s:"Share with Bloomie",it:[
    {ic:"\u{1F4CE}",l:"Upload a file",d:"PDF, doc, image, spreadsheet",a:"upload"},
    {ic:"\u{1F4F7}",l:"Take a photo",d:"Camera capture",a:"camera"},
    {ic:"\u{1F399}",l:"Voice message",d:"Record and send audio",a:"voice"}]},
  {s:"Connect a folder",it:[
    {ic:"\u{1F4BB}",l:"Local files",d:"Browse your hard drive",a:"local"},
    {l:"Google Drive",d:"Read & write to your Drive",a:"gdrive",brand:{bg:"#4285F4"}},
    {l:"Dropbox",d:"Sync a Dropbox folder",a:"dropbox",brand:{bg:"#0061FF"}},
    {l:"Notion",d:"Read & edit Notion pages",a:"notion",brand:{bg:"#000000"}},
    {l:"GitHub",d:"Access repos, push code",a:"github",brand:{bg:"#24292e"}},
    {l:"OneDrive",d:"Microsoft file access",a:"onedrive",brand:{bg:"#0078D4"}}]},
  {s:"Run a skill",it:[
    {ic:"\u{1F310}",l:"Browse the web",d:"Research, scrape, fill forms",a:"sk_browser"},
    {ic:"\u{1F5A5}",l:"Run code",d:"Python or Node.js sandbox",a:"sk_code"},
    {ic:"\u{1F4CA}",l:"Create spreadsheet",d:"Excel, CSV, financial model",a:"sk_sheet"},
    {ic:"\u{1F3AC}",l:"Create presentation",d:"Pitch deck, slides",a:"sk_pptx"},
    {ic:"\u{1F4C4}",l:"Create document",d:"Report, proposal, letter",a:"sk_doc"},
    {ic:"\u{1F4C8}",l:"Create chart",d:"Bar, line, pie visualization",a:"sk_chart"},
    {ic:"\u{1F680}",l:"Deploy to web",d:"Publish a live page",a:"sk_deploy"},
    {ic:"\u{1F3AC}",l:"Download video",d:"YouTube, TikTok, Instagram & more",a:"sk_video"},
    {ic:"\u{1F4E8}",l:"Send to someone",d:"Email, Slack, or share link",a:"sk_send"}]}
];

var MN={auto:"Best for task",opus:"Opus",sonnet:"Sonnet",haiku:"Haiku",gpt4o:"GPT-4o",gemini:"Gemini"};

function BrandLogo({name,sz}){
  var s=sz||18;
  var logos={
    "WhatsApp":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.008a9.876 9.876 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.16 12.009C2.162 6.564 6.609 2.12 12.058 2.12a9.84 9.84 0 016.983 2.892 9.84 9.84 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zM20.52 3.449A11.8 11.8 0 0012.05.002C5.464.002.103 5.36.1 11.95a11.88 11.88 0 001.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 005.683 1.448h.005c6.585 0 11.946-5.36 11.95-11.95a11.87 11.87 0 00-3.48-8.395z"/></svg>},
    "Telegram":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>},
    "Discord":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>},
    "Slack":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.163 0a2.528 2.528 0 012.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.163 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.315A2.528 2.528 0 0124 15.163a2.528 2.528 0 01-2.522 2.523h-6.315z"/></svg>},
    "Signal":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M12 1.5C6.21 1.5 1.5 6.21 1.5 12c0 1.83.47 3.55 1.3 5.05L1.5 22.5l5.45-1.3A10.45 10.45 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5S17.79 1.5 12 1.5zm0 2a8.5 8.5 0 110 17 8.5 8.5 0 010-17z"/></svg>},
    "Web Chat":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>},
    "Gmail":function(){return <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.73l8.073-6.236C21.691 2.28 24 3.434 24 5.457z"/></svg>}
  };
  var fn=logos[name];
  return fn?fn():null;
}

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */
function useW(){var s=useState(typeof window!=="undefined"?window.innerWidth:1200);useEffect(function(){var f=function(){s[1](window.innerWidth)};window.addEventListener("resize",f);return function(){window.removeEventListener("resize",f)};},[]);return s[0];}

/* ═══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Ring({pct,sz,cl,children}){var s=sz||52,r=(s-5)/2,c=2*Math.PI*r;return(<div style={{position:"relative",width:s,height:s,flexShrink:0}}><svg width={s} height={s} style={{transform:"rotate(-90deg)"}}><circle cx={s/2} cy={s/2} r={r} fill="none" stroke="currentColor" opacity={.1} strokeWidth={5}/><circle cx={s/2} cy={s/2} r={r} fill="none" stroke={cl} strokeWidth={5} strokeDasharray={c} strokeDashoffset={c-(pct/100)*c} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div></div>);}

function Face({sz,agent,editable}){
  var s=sz||30;var ag=agent||AGENTS[0];
  var editBadge=editable&&s>=36?(
    <div style={{position:"absolute",bottom:-1,right:-1,width:Math.max(16,s*.24),height:Math.max(16,s*.24),borderRadius:"50%",background:"#fff",border:"1.5px solid #ddd",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,.15)",cursor:"pointer",zIndex:2}}>
      <span style={{fontSize:Math.max(8,s*.12)}}>{"✏️"}</span>
    </div>
  ):null;
  if(ag.img){return(
    <div style={{width:s,height:s,flexShrink:0,position:"relative"}}>
      <div style={{width:s,height:s,borderRadius:s*.3,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.12)",background:ag.grad}}>
        <img src={ag.img} alt={ag.nm} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
      </div>
      {editBadge}
    </div>
  );}
  var ini=ag.nm.split(" ").map(function(w){return w[0]}).join("").slice(0,2);
  return(
    <div style={{width:s,height:s,flexShrink:0,position:"relative"}}>
      <div style={{width:s,height:s,borderRadius:s*.3,overflow:"hidden",background:ag.grad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
        <span style={{fontSize:s*.38,fontWeight:700,color:"#fff"}}>{ini}</span>
      </div>
      {editBadge}
    </div>
  );
}

function Bloom({sz,glow}){var s=sz||36;return(<div style={{position:"relative",width:s,height:s,flexShrink:0}}>{glow&&<div style={{position:"absolute",inset:-4,borderRadius:s*.28+4,background:"radial-gradient(circle,#F4A26140 0%,#E76F8B20 50%,transparent 70%)",animation:"bloomGlow 2.5s ease-in-out infinite"}}/>}<div style={{width:s,height:s,borderRadius:s*.28,overflow:"hidden",background:"linear-gradient(135deg,#F4A261,#E76F8B)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 12px #E76F8B40",position:"relative",zIndex:1}}><svg width={s*.65} height={s*.65} viewBox="0 0 100 100" fill="none">{[0,72,144,216,288].map(function(r,i){return <ellipse key={i} cx="50" cy="38" rx="14" ry="20" fill="#fff" opacity={i%2===0?.9:.8} transform={"rotate("+r+" 50 50)"}/>})}<circle cx="50" cy="50" r="10" fill="#FFE0C2"/><circle cx="50" cy="50" r="5" fill="#F4A261"/></svg></div></div>);}

function Bar({pct,cl}){return(<div style={{width:"100%",height:6,borderRadius:3,background:"currentColor",opacity:.08,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:pct+"%",background:"linear-gradient(90deg,"+cl+","+cl+"BB)",position:"relative",transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}><div style={{position:"absolute",right:-1,top:-2,width:10,height:10,borderRadius:"50%",background:cl,boxShadow:"0 0 8px "+cl+"66",animation:"pulse 1.5s ease infinite"}}/></div></div></div>);}

/* ═══════════════════════════════════════════════════════════════
   SCREEN VIEWER — docked / fullscreen / popout
   ═══════════════════════════════════════════════════════════════ */
function Screen({c,mob,live,mode,setMode,onCmd}){
  if(mode==="hidden") return null;
  var _fi=useState(""),fiV=_fi[0],setFiV=_fi[1];
  var _fmic=useState(false),fMic=_fmic[0],setFMic=_fmic[1];
  var _fVis=useState(true),fBarVis=_fVis[0],setFBarVis=_fVis[1];

  var wrap=mode==="full"?{position:"fixed",inset:0,zIndex:300,background:"#000",display:"flex",flexDirection:"column"}
    :mode==="pop"?{position:"fixed",bottom:mob?12:20,right:mob?12:20,width:mob?200:340,height:mob?130:210,zIndex:250,borderRadius:14,overflow:"hidden",boxShadow:"0 12px 48px rgba(0,0,0,.45)",border:"2px solid "+c.ac+"60",resize:"both"}
    :{borderRadius:12,overflow:"hidden",border:"1.5px solid "+(live?c.gr+"50":c.ln),marginBottom:0,maxHeight:"100%"};

  var barH=mob?32:36;

  return(
    <div style={wrap}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px",height:barH,background:mode==="full"?"#111":c.cd,borderBottom:"1px solid "+c.ln,cursor:mode==="pop"?"grab":"default",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:live?"#34A853":c.fa,animation:live?"pulse 1.2s ease infinite":"none"}}/>
          <span style={{fontSize:11,fontWeight:600,color:live?c.gr:c.so}}>{live?"LIVE":"Idle"}</span>
          {live&&<span style={{fontSize:10,color:c.so,marginLeft:2}}>Chromium</span>}
        </div>
        <div style={{display:"flex",gap:4}}>
          {mode!=="pop"&&<button onClick={function(){setMode("pop")}} title="Pop out" style={bBtn(c)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="1.8"><path d="M9 2h5v5M14 2L8 8M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3"/></svg>
          </button>}
          {mode!=="full"&&<button onClick={function(){setMode("full")}} title="Fullscreen" style={bBtn(c)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="1.8"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg>
          </button>}
          {mode==="pop"&&<button onClick={function(){setMode("docked")}} title="Dock" style={bBtn(c)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="1.8"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12"/></svg>
          </button>}
          {(mode==="full"||mode==="pop")&&<button onClick={function(){setMode(mode==="full"?"docked":"hidden")}} title="Close" style={bBtn(c)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>}
          {mode==="docked"&&<button onClick={function(){setMode("hidden")}} title="Hide" style={bBtn(c)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="2"><path d="M3 8h10"/></svg>
          </button>}
        </div>
      </div>
      <div style={{background:"#0a0a0a",flex:mode==="full"?1:undefined,aspectRatio:mode==="full"?undefined:"16/9",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        {live?(
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:mode==="pop"?(mob?"94%":"90%"):mob?"85%":"65%",background:"#161616",borderRadius:mode==="pop"?4:8,overflow:"hidden",border:"1px solid #333",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
              <div style={{padding:mode==="pop"?"3px 6px":"6px 10px",background:"#1c1c1c",display:"flex",alignItems:"center",gap:mode==="pop"?3:6}}>
                <div style={{display:"flex",gap:mode==="pop"?2:4}}>{["#ff5f57","#febc2e","#28c840"].map(function(co,i){return <div key={i} style={{width:mode==="pop"?5:8,height:mode==="pop"?5:8,borderRadius:"50%",background:co}}/>;})}</div>
                <div style={{flex:1,padding:mode==="pop"?"1px 4px":"3px 8px",borderRadius:4,background:"#111",fontSize:mode==="pop"?7:10,color:"#888",fontFamily:"monospace",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>census.gov/data/datasets/income-poverty</div>
              </div>
              <div style={{padding:mode==="pop"?6:mob?12:20}}>
                <div style={{height:mode==="pop"?5:10,width:"60%",background:"#2a2a2a",borderRadius:3,marginBottom:mode==="pop"?4:8}}/>
                <div style={{height:mode==="pop"?4:8,width:"90%",background:"#222",borderRadius:3,marginBottom:mode==="pop"?3:6}}/>
                <div style={{height:mode==="pop"?4:8,width:"75%",background:"#222",borderRadius:3,marginBottom:mode==="pop"?5:12}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:mode==="pop"?3:6}}>
                  {[35,55,25].map(function(h,i){return <div key={i} style={{height:mode==="pop"?h*.4:h,background:"linear-gradient(180deg,#F4A261"+(15+i*10)+",#E76F8B15)",borderRadius:3}}/>;})}</div>
                <div style={{height:mode==="pop"?4:8,width:"80%",background:"#222",borderRadius:3,marginTop:mode==="pop"?4:10}}/>
              </div>
            </div>
            {mode!=="pop"&&<div style={{position:"absolute",bottom:mode==="full"?16:8,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"#888",background:"#0a0a0acc",padding:"3px 12px",borderRadius:20}}>Extracting household income data\u2026</div>}
          </div>
        ):(
          <div style={{textAlign:"center",padding:mode==="pop"?10:30}}>
            <div style={{fontSize:mode==="pop"?20:36,marginBottom:mode==="pop"?4:10,opacity:.3}}>{"\u{1F5A5}"}</div>
            {mode!=="pop"&&<><div style={{fontSize:13,color:"#666",marginBottom:4}}>Browser idle</div><div style={{fontSize:11,color:"#555"}}>Activates when Bloomie starts browsing</div></>}
          </div>
        )}
        {live&&<div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.02) 2px,rgba(0,0,0,.02) 4px)",pointerEvents:"none"}}/>}
      </div>
    </div>
  );
}
function bBtn(c){return{width:24,height:24,borderRadius:6,border:"1px solid "+c.ln,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0};}

/* ═══════════════════════════════════════════════════════════════
   PLUS MENU
   ═══════════════════════════════════════════════════════════════ */
function PMenu({c,mob,onClose,onAct}){
  return(
    <div style={{position:"absolute",bottom:"100%",left:0,marginBottom:8,width:mob?"calc(100vw - 24px)":380,maxHeight:440,overflowY:"auto",background:c.cd,borderRadius:16,border:"1px solid "+c.ln,boxShadow:"0 12px 48px rgba(0,0,0,.22)",animation:"pop .2s ease",zIndex:30}}>
      <div style={{padding:"12px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+c.ln,position:"sticky",top:0,background:c.cd,zIndex:2}}>
        <span style={{fontSize:14,fontWeight:700,color:c.tx}}>Add to chat</span>
        <button onClick={onClose} style={{width:26,height:26,borderRadius:7,border:"1px solid "+c.ln,background:c.cd,cursor:"pointer",fontSize:13,color:c.so,display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u2715"}</button>
      </div>
      {PLUS.map(function(g,gi){return(
        <div key={gi}>
          <div style={{padding:"10px 16px 4px",fontSize:10,fontWeight:700,color:c.fa,textTransform:"uppercase",letterSpacing:.8}}>{g.s}</div>
          {g.it.map(function(item,ii){return(
            <button key={ii} onClick={function(){onAct(item.a);onClose();}} style={{width:"100%",textAlign:"left",padding:"9px 16px",border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",gap:12}} onMouseEnter={function(e){e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}>
              {item.brand?(
                <span style={{width:34,height:34,borderRadius:9,background:item.brand.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:0}}><BrandLogo name={item.l} sz={18}/></span>
              ):(
                <span style={{width:34,height:34,borderRadius:9,background:c.sf,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.ic}</span>
              )}
              <div><div style={{fontSize:13,fontWeight:600,color:c.tx}}>{item.l}</div><div style={{fontSize:11,color:c.so,marginTop:1}}>{item.d}</div></div>
            </button>
          );})}
        </div>
      );})}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export default function BloomieDashboard(){
  var W=useW(),mob=W<768;
  var _dk=useState(true),dark=_dk[0],setDark=_dk[1];
  var c=mk(dark);

  var _pg=useState("chat"),pg=_pg[0],setPg=_pg[1];
  var _pk=useState("school"),pk=_pk[0],setPk=_pk[1];
  var _biz=useState("bloom"),bizId=_biz[0],setBizId=_biz[1];
  var _bpj=useState("bloombot"),bpjId=_bpj[0],setBpjId=_bpj[1];
  var _agt=useState("sarah"),agtId=_agt[0],setAgtId=_agt[1];
  var _agO=useState(false),agO=_agO[0],setAgO=_agO[1];
  var _bzO=useState(false),bzO=_bzO[0],setBzO=_bzO[1];
  var _bpO=useState(false),bpO=_bpO[0],setBpO=_bpO[1];
  var curBiz=BIZ.find(function(b){return b.id===bizId})||BIZ[0];
  var curBpj=(curBiz.pj||[]).find(function(p){return p.id===bpjId})||(curBiz.pj||[])[0];
  var curAgent=AGENTS.find(function(a){return a.id===agtId})||AGENTS[0];
  var _nw=useState(true),isNew=_nw[0],setNew=_nw[1];
  var _ms=useState([]),ms=_ms[0],setMs=_ms[1];
  var _tx=useState(""),tx=_tx[0],setTx=_tx[1];
  var _si=useState(0),sim=_si[0],setSim=_si[1];
  var _df=useState("recent"),dFilt=_df[0],setDFilt=_df[1];
  var _dp=useState("all"),dProj=_dp[0],setDProj=_dp[1];
  var _pa=useState(null),panel=_pa[0],setPanel=_pa[1];
  var _as=useState("new"),aSess=_as[0],setASess=_as[1];
  var _dv=useState(false),dev=_dv[0],setDev=_dv[1];
  var _dvp=useState("Overview"),dvPg=_dvp[0],setDvPg=_dvp[1];
  var _sb=useState(!mob?"full":"closed"),sbO=_sb[0],setSbO=_sb[1];
  var sbOpen=sbO==="full"||sbO==="mini";
  var _st=useState(false),stO=_st[0],setStO=_st[1];
  var _hlp=useState(false),hlpO=_hlp[0],setHlpO=_hlp[1];
  var _stb=useState("General"),stab=_stb[0],setStab=_stb[1];
  var _md=useState("auto"),mdl=_md[0],setMdl=_md[1];
  var _mn=useState(false),mnO=_mn[0],setMnO=_mn[1];
  var _um=useState(false),umO=_um[0],setUmO=_um[1];
  var _pl=useState(false),plO=_pl[0],setPlO=_pl[1];
  var _scr=useState("docked"),scrM=_scr[0],setScrM=_scr[1];
  var _scrL=useState(true),scrLive=_scrL[0];
  var _vc=useState(false),vcRec=_vc[0],setVcRec=_vc[1];
  var _artFull=useState(false),artFull=_artFull[0],setArtFull=_artFull[1];
  var _rating=useState(null),rating=_rating[0],setRating=_rating[1];
  var _rated=useState(false),rated=_rated[0],setRated=_rated[1];
  var _chatW=useState(340),chatW=_chatW[0],setChatW=_chatW[1];
  var dragRef=useRef(null);
  var vcRef=useRef(null);
  var btm=useRef(null),fRef=useRef(null);
  var pj=PJ.find(function(p){return p.id===pk});

  useEffect(function(){if(btm.current){setTimeout(function(){btm.current&&btm.current.scrollIntoView({behavior:"smooth"})},100);}},[ms]);
  useEffect(function(){if(pg!=="home")return;var t=setInterval(function(){setSim(function(s){return s<3?s+1:s})},3000);return function(){clearInterval(t)};},[pg]);

  function startDrag(e){
    e.preventDefault();
    var startX=e.clientX||e.touches[0].clientX,startW=chatW;
    function onMove(ev){
      var x=ev.clientX||((ev.touches&&ev.touches[0])?ev.touches[0].clientX:startX);
      var nw=startW+(x-startX);
      setChatW(Math.max(150,Math.min(nw,800)));
    }
    function onUp(){document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);document.removeEventListener("touchmove",onMove);document.removeEventListener("touchend",onUp);document.body.style.cursor="";document.body.style.userSelect="";}
    document.body.style.cursor="col-resize";document.body.style.userSelect="none";
    document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);document.addEventListener("touchmove",onMove);document.addEventListener("touchend",onUp);
  }
  useEffect(function(){if(!umO)return;var h=function(){setUmO(false)};setTimeout(function(){document.addEventListener("click",h)},0);return function(){document.removeEventListener("click",h)};},[umO]);
  useEffect(function(){if(!bzO)return;var h=function(){setBzO(false)};setTimeout(function(){document.addEventListener("click",h)},0);return function(){document.removeEventListener("click",h)};},[bzO]);
  useEffect(function(){if(!bpO)return;var h=function(){setBpO(false)};setTimeout(function(){document.addEventListener("click",h)},0);return function(){document.removeEventListener("click",h)};},[bpO]);
  useEffect(function(){if(!agO)return;var h=function(){setAgO(false)};setTimeout(function(){document.addEventListener("click",h)},0);return function(){document.removeEventListener("click",h)};},[agO]);

  var load=function(sid){setASess(sid);if(sid==="new"){setNew(true);setMs([]);return;}setNew(false);if(mob)setSbO(false);
    if(sid==="s1"){setMs([{id:1,b:true,t:"Hey Charles! I've been working since 7:30 this morning. The Eventbrite is done, and I'm making progress on three things right now.",tm:"8:02 AM"},{id:2,tp:"working"},{id:3,b:false,t:"Nice! Finish the landing page first, then make me the graphics.",tm:"8:15 AM"},{id:4,b:true,t:"Got it. Landing page first, then all 5 graphic sizes by 3pm. I'll send each one for your approval.",tm:"8:15 AM"},{id:5,tp:"done",nm:"Eventbrite Listing",ic:"\u{1F3A4}",did:6},{id:6,b:true,t:"I also finished drafting that confirmation email to the venue. Take a look and approve it if it's good to send.",tm:"8:18 AM"},{id:7,tp:"artifact",ad:DL[6]}]);}
    else{setMs([{id:1,b:true,t:"This is the conversation from \""+(SS.find(function(s){return s.id===sid})||{}).tl+"\". Previous messages would load here.",tm:"Earlier"}]);}};

  var send=function(){if(!tx.trim())return;var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});if(isNew){setNew(false);setASess("s1");}setMs(function(p){return p.concat([{id:Date.now(),b:false,t:tx,tm:t}])});setTx("");
    setTimeout(function(){var tm=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});setMs(function(p){return p.concat([{id:Date.now(),b:true,t:"On it, Charles. I\u2019ll show you the progress right here.",tm:tm},{id:Date.now()+1,tp:"working"}])});},1200);
    setTimeout(function(){var tm=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});setMs(function(p){return p.concat([{id:Date.now(),tp:"done",nm:"Eventbrite Listing",ic:"\u{1F517}",did:6},{id:Date.now()+1,b:true,t:"The Eventbrite is live! I also finished the venue confirmation email. Take a look and approve it if it\u2019s good to send.",tm:tm},{id:Date.now()+2,tp:"artifact",ad:DL[6]}])});},4000);
  };

  var plusAct=function(a){if(a==="upload"){if(fRef.current)fRef.current.click();return;}var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});var lb={camera:"Opening camera\u2026",voice:"Recording voice message\u2026",local:"Opening file browser \u2014 select a folder to share with Bloomie.",gdrive:"Connecting to Google Drive\u2026",dropbox:"Connecting to Dropbox\u2026",notion:"Connecting to Notion\u2026",github:"Connecting to GitHub\u2026",onedrive:"Connecting to OneDrive\u2026",sk_browser:"What should I look up?",sk_code:"What should the script do?",sk_sheet:"What data should I put in the spreadsheet?",sk_pptx:"What's the presentation about?",sk_doc:"What kind of document do you need?",sk_chart:"What data should I visualize?",sk_deploy:"What should I publish to the web?"};setMs(function(p){return p.concat([{id:Date.now(),b:true,t:lb[a]||"Starting "+a+"\u2026",tm:t}])});if(a==="sk_browser"&&scrM==="hidden")setScrM("docked");};

  var onFile=function(e){var f=e.target.files;if(!f||!f.length)return;var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});var n=Array.from(f).map(function(x){return x.name}).join(", ");setMs(function(p){return p.concat([{id:Date.now(),b:false,t:"\u{1F4CE} Shared: "+n,tm:t},{id:Date.now()+1,b:true,t:"Got it! I can see "+(f.length>1?"those files":"\"" + f[0].name + "\"")+". What would you like me to do with "+(f.length>1?"them":"it")+"?",tm:t}])});e.target.value="";};

  var toggleVoice=function(){
    if(vcRec){if(vcRef.current){try{vcRef.current.stop();}catch(e){}}setVcRec(false);return;}
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setMs(function(p){return p.concat([{id:Date.now(),b:true,t:"Voice input isn\u2019t supported in this browser. Try Chrome or Edge for speech recognition.",tm:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}])});return;}
    var r=new SR();r.continuous=false;r.interimResults=true;r.lang="en-US";
    r.onresult=function(ev){var t="";for(var i=0;i<ev.results.length;i++){t+=ev.results[i][0].transcript;}setTx(t);};
    r.onend=function(){setVcRec(false);vcRef.current=null;};
    r.onerror=function(){setVcRec(false);vcRef.current=null;};
    vcRef.current=r;r.start();setVcRec(true);
  };

  var approve=function(){if(!panel)return;setRated(true);};
  var submitRating=function(){if(!panel)return;var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});var a=panel;var stars=rating||5;setMs(function(p){return p.concat([{id:Date.now(),tp:"done",nm:a.nm,ic:a.ic,did:a.id},{id:Date.now()+1,b:true,t:'"'+a.nm+'" is approved and saved! Thanks for the '+stars+'-star rating \u2014 helps me learn what you like.',tm:t}])});setPanel(null);setRated(false);setRating(null);};
  var skipRating=function(){if(!panel)return;var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});var a=panel;setMs(function(p){return p.concat([{id:Date.now(),tp:"done",nm:a.nm,ic:a.ic,did:a.id},{id:Date.now()+1,b:true,t:'"'+a.nm+'" is approved and saved!',tm:t}])});setPanel(null);setRated(false);setRating(null);};
  var openPanel=function(d){setPanel(d);setRated(false);setRating(null);setArtFull(false);};
  var revise=function(){if(!panel)return;var t=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});setMs(function(p){return p.concat([{id:Date.now(),b:true,t:"No problem \u2014 what would you like me to change on \""+panel.nm+"\"?",tm:t}])});setPanel(null);setRated(false);setRating(null);setPg("chat");};

  var tMdl={"Demographic Research":"sonnet","Chapter 2: Why Classical Education":"opus","Building the Landing Page":"sonnet"};
  var allW=PJ.map(function(p){var m=mdl==="auto"?(tMdl[p.at.nm]||"sonnet"):mdl;return{nm:p.at.nm,ic:p.ic,cl:p.cl,pct:p.at.pct,tm:p.at.tm,mdl:MN[m]||m}});

  var gSim=function(steps){return steps.map(function(s){if(s.d)return s;var pi=steps.filter(function(x){return!x.d}).indexOf(s);if(pi<sim)return Object.assign({},s,{d:true,a:false,tm:"Just now"});if(pi===sim)return Object.assign({},s,{a:true});return Object.assign({},s,{a:false});});};
  var sSteps=gSim(pj.at.steps);
  var sDone=sSteps.filter(function(s){return s.d}).length;
  var sPct=Math.round((sDone/sSteps.length)*100);
  var gFilt=function(){var it=DL.slice();if(dProj!=="all")it=it.filter(function(d){return d.pj===dProj});if(dFilt==="recent")it.sort(function(a,b){return b.ds.localeCompare(a.ds)});if(dFilt==="oldest")it.sort(function(a,b){return a.ds.localeCompare(b.ds)});return it;};
  var shP=panel!==null;

  return(
    <div style={{minHeight:"100vh",background:c.bg,fontFamily:"'Inter',system-ui,-apple-system,sans-serif",color:c.tx}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes bloomGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes slideL{from{transform:translateX(-100%)}to{transform:translateX(0)}}@keyframes bloomieWiggle{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}*{box-sizing:border-box;margin:0;padding:0}input:focus,button:focus{outline:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:"+c.ln+";border-radius:10px}"}</style>
      <input ref={fRef} type="file" multiple style={{display:"none"}} onChange={onFile}/>
      <div style={{padding:mob?"8px 12px":"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",background:c.cd,borderBottom:"1px solid "+c.ln,position:"sticky",top:0,zIndex:60,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:mob?6:10}}>
          {pg==="chat"&&<button onClick={function(){setSbO(sbO==="full"?"mini":sbO==="mini"?"closed":"full")}} style={{width:32,height:32,borderRadius:8,border:"1px solid "+c.ln,background:c.cd,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:c.so,flexShrink:0}}>{"\u2630"}</button>}
          <img src={BLOOMIE_IMG} alt="Bloomie" style={{width:mob?28:32,height:mob?28:32,objectFit:"contain",flexShrink:0,animation:"bloomieWiggle 3s ease-in-out infinite"}}/>
          {!mob&&<span style={{fontSize:16,fontWeight:700,color:c.tx}}>Bloomie</span>}
          {!mob&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:6,background:"#E76F8B20",color:"#E76F8B",letterSpacing:.5}}>BETA</span>}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:mob?6:12,flexWrap:"nowrap"}}>
          <div style={{display:"flex",gap:mob?2:4,background:c.sf,padding:3,borderRadius:10}}>
            {[{k:"chat",l:mob?"\u{1F4AC}":"\u{1F4AC} Chat"},{k:"home",l:mob?"\u{1F4CA}":"\u{1F4CA} Status"},{k:"files",l:mob?"\u{1F4C1}":"\u{1F4C1} Files"}].map(function(t){return <button key={t.k} onClick={function(){setPg(t.k)}} style={{padding:mob?"7px 10px":"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:pg===t.k?c.cd:"transparent",color:pg===t.k?c.tx:c.so,boxShadow:pg===t.k?"0 1px 4px rgba(0,0,0,.06)":"none"}}>{t.l}</button>})}
          </div>
          {!mob&&<div style={{width:1,height:28,background:c.ln,flexShrink:0}}/>}
          <div style={{display:"flex",gap:mob?4:6,alignItems:"flex-end"}}>
            <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:mob?"center":"flex-start"}}>
              {!mob&&<div style={{fontSize:9,fontWeight:700,color:c.fa,textTransform:"uppercase",letterSpacing:.8,marginBottom:2,userSelect:"none"}}>Business</div>}
              <button onClick={function(e){e.stopPropagation();setBzO(!bzO);setBpO(false)}} style={{padding:mob?"7px 8px":"5px 10px",borderRadius:8,border:"1.5px dashed "+(bzO?curBiz.cl:c.ln),background:bzO?curBiz.cl+"12":c.cd,cursor:"pointer",fontSize:12,fontWeight:600,color:bzO?curBiz.cl:c.so,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"all .15s"}}>
                <span style={{fontSize:14}}>{curBiz.ic}</span>{!mob&&curBiz.nm}<span style={{fontSize:10,opacity:.5,transform:bzO?"rotate(180deg)":"none",transition:"transform .2s"}}>{"\u25BC"}</span>
              </button>
              {bzO&&<div style={{position:"absolute",top:"100%",left:0,marginTop:6,width:220,background:c.cd,borderRadius:12,border:"1px solid "+c.ln,boxShadow:"0 12px 40px rgba(0,0,0,.22)",overflow:"hidden",animation:"pop .2s ease",zIndex:90}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid "+c.ln}}><div style={{fontSize:10,fontWeight:700,color:c.fa,textTransform:"uppercase",letterSpacing:.5}}>Business</div></div>
                {BIZ.map(function(b){var sel=b.id===bizId;return <button key={b.id} onClick={function(e){e.stopPropagation();setBizId(b.id);setBpjId((b.pj||[])[0]?b.pj[0].id:"");setBzO(false);setPg("home");setSim(0)}} style={{width:"100%",padding:"10px 14px",border:"none",cursor:"pointer",background:sel?b.cl+"12":"transparent",display:"flex",alignItems:"center",gap:10,textAlign:"left",transition:"background .1s"}} onMouseEnter={function(e){if(!sel)e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){if(!sel)e.currentTarget.style.background="transparent"}}>
                  <span style={{width:28,height:28,borderRadius:8,background:b.cl+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{b.ic}</span>
                  <div><div style={{fontSize:13,fontWeight:sel?700:500,color:sel?b.cl:c.tx}}>{b.nm}</div><div style={{fontSize:10,color:c.so}}>{b.pj.length} projects</div></div>
                  {sel&&<span style={{marginLeft:"auto",fontSize:14,color:b.cl}}>{"\u2713"}</span>}
                </button>})}
                <div style={{padding:"8px 14px",borderTop:"1px solid "+c.ln}}><button style={{width:"100%",padding:"8px",borderRadius:8,border:"1.5px dashed "+c.ac+"40",background:"transparent",cursor:"pointer",fontSize:12,color:c.ac,fontWeight:600}}>+ Add Business</button></div>
              </div>}
            </div>
            <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:mob?"center":"flex-start"}}>
              {!mob&&<div style={{fontSize:9,fontWeight:700,color:c.fa,textTransform:"uppercase",letterSpacing:.8,marginBottom:2,userSelect:"none"}}>Project</div>}
              <button onClick={function(e){e.stopPropagation();setBpO(!bpO);setBzO(false)}} style={{padding:mob?"7px 8px":"5px 10px",borderRadius:8,border:"1.5px dashed "+(bpO?curBiz.cl:c.ln),background:bpO?curBiz.cl+"12":c.cd,cursor:"pointer",fontSize:12,fontWeight:600,color:bpO?curBiz.cl:c.so,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"all .15s"}}>
                <span style={{fontSize:14}}>{curBpj?curBpj.ic:"\u{1F4C2}"}</span>{!mob&&(curBpj?curBpj.nm:"Project")}<span style={{fontSize:10,opacity:.5,transform:bpO?"rotate(180deg)":"none",transition:"transform .2s"}}>{"\u25BC"}</span>
              </button>
              {bpO&&<div style={{position:"absolute",top:"100%",right:0,marginTop:6,width:220,background:c.cd,borderRadius:12,border:"1px solid "+c.ln,boxShadow:"0 12px 40px rgba(0,0,0,.22)",overflow:"hidden",animation:"pop .2s ease",zIndex:90}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid "+c.ln}}><div style={{fontSize:10,fontWeight:700,color:c.fa,textTransform:"uppercase",letterSpacing:.5}}>{curBiz.nm} Projects</div></div>
                {(curBiz.pj||[]).map(function(p){var sel=curBpj&&p.id===curBpj.id;return <button key={p.id} onClick={function(e){e.stopPropagation();setBpjId(p.id);setBpO(false);setPg("home");setSim(0)}} style={{width:"100%",padding:"10px 14px",border:"none",cursor:"pointer",background:sel?curBiz.cl+"12":"transparent",display:"flex",alignItems:"center",gap:10,textAlign:"left",transition:"background .1s"}} onMouseEnter={function(e){if(!sel)e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){if(!sel)e.currentTarget.style.background="transparent"}}>
                  <span style={{fontSize:15}}>{p.ic}</span>
                  <span style={{fontSize:13,fontWeight:sel?700:500,color:sel?curBiz.cl:c.tx}}>{p.nm}</span>
                  {sel&&<span style={{marginLeft:"auto",fontSize:14,color:curBiz.cl}}>{"\u2713"}</span>}
                </button>})}
                <div style={{padding:"8px 14px",borderTop:"1px solid "+c.ln}}><button style={{width:"100%",padding:"8px",borderRadius:8,border:"1.5px dashed "+c.ac+"40",background:"transparent",cursor:"pointer",fontSize:12,color:c.ac,fontWeight:600}}>+ Add Project</button></div>
              </div>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
          {scrM==="hidden"&&<button onClick={function(){setScrM("docked")}} title="Show screen" style={{width:32,height:32,borderRadius:8,border:"1px solid "+c.ln,background:c.cd,cursor:"pointer",fontSize:14,color:c.so,display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u{1F5A5}"}</button>}
          <button onClick={function(){setUmO(!umO)}} style={{width:36,height:36,borderRadius:"50%",border:umO?"2px solid "+c.ac:"2px solid "+c.ln,background:"linear-gradient(135deg,#F4A261,#E76F8B)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",transition:"border-color .15s"}}>C</button>
          {umO&&(
            <div style={{position:"absolute",top:"100%",right:0,marginTop:8,width:220,background:c.cd,borderRadius:14,border:"1px solid "+c.ln,boxShadow:"0 12px 40px rgba(0,0,0,.22)",overflow:"hidden",animation:"pop .2s ease",zIndex:80}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid "+c.ln,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#F4A261,#E76F8B)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>C</div>
                <div><div style={{fontSize:13,fontWeight:700,color:c.tx}}>Charles</div><div style={{fontSize:11,color:c.so}}>Owner</div></div>
              </div>
              <button onClick={function(){setUmO(false);setDark(!dark)}} style={{width:"100%",textAlign:"left",padding:"11px 16px",border:"none",cursor:"pointer",background:"transparent",fontSize:13,color:c.tx,display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+c.ln}} onMouseEnter={function(e){e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:16}}>{dark?"\u2600\uFE0F":"\u{1F319}"}</span>{dark?"Light mode":"Dark mode"}
              </button>
              <button onClick={function(){setUmO(false);setStO(true)}} style={{width:"100%",textAlign:"left",padding:"11px 16px",border:"none",cursor:"pointer",background:"transparent",fontSize:13,color:c.tx,display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+c.ln}} onMouseEnter={function(e){e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:16}}>{"\u2699\uFE0F"}</span>Settings
              </button>
              <button onClick={function(){setUmO(false);setDev(!dev)}} style={{width:"100%",textAlign:"left",padding:"11px 16px",border:"none",cursor:"pointer",background:"transparent",fontSize:13,color:dev?c.ac:c.tx,display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+c.ln}} onMouseEnter={function(e){e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:16}}>{"\u{1F4BB}"}</span>Developer mode{dev?" (ON)":""}
              </button>
              <button style={{width:"100%",textAlign:"left",padding:"11px 16px",border:"none",cursor:"pointer",background:"transparent",fontSize:13,color:"#D44",display:"flex",alignItems:"center",gap:10}} onMouseEnter={function(e){e.currentTarget.style.background=c.hv}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:16}}>{"\u{1F6AA}"}</span>Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{display:"flex",position:"relative"}}>
        <div style={{textAlign:"center",padding:40,minHeight:"calc(100vh - 52px)",display:"flex",alignItems:"center",justifyContent:"center",flex:1}}>
          <div>
            <div style={{fontSize:48,marginBottom:16}}>{"\u{1F338}"}</div>
            <h1 style={{fontSize:24,fontWeight:700,color:c.tx,marginBottom:8}}>Bloomie Dashboard v11</h1>
            <p style={{fontSize:14,color:c.so}}>React application successfully built and ready to deploy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
