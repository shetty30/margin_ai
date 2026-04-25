import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { dashboard } from '../api/client'
import { BarChart, Bar, Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN')

export default function Dashboard() {
  const [data, setData] = useState(null)
  const now = new Date()
  useEffect(() => {
    dashboard.get(now.getFullYear(), now.getMonth()+1).then(r=>setData(r.data)).catch(console.error)
  }, [])

  if (!data) return <div className="p-6"><div className="h-40 rounded-2xl animate-pulse" style={{background:'rgba(255,255,255,0.04)'}}/></div>

  const COLORS = ['#6c5ce7','#0984e3','#00b894','#fd79a8','#fdcb6e','#a29bfe','#636e72']
  const pct = Math.min(Math.round((data.total_spent/data.expense_budget)*100), 100)

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="rounded-2xl p-6 relative overflow-hidden" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" style={{background:'radial-gradient(circle,rgba(108,92,231,0.08),transparent 70%)'}}/>
        <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Your margin · {now.toLocaleString('en',{month:'long'})} {now.getFullYear()}</p>
        <p className="text-4xl font-medium text-white tracking-tight">{fmt(data.remaining)}</p>
        <p className="text-white/30 text-sm mt-1">of {fmt(data.expense_budget)} budget · {fmt(data.total_spent)} spent</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/25 mb-1.5"><span>{pct}% used</span><span>{now.getDate()} days in</span></div>
          <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
            <motion.div className="h-full rounded-full" style={{background:'linear-gradient(90deg,#6c5ce7,#0984e3)'}} initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2,ease:[.4,0,.2,1]}}/>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0 mt-4 pt-4" style={{borderTop:'0.5px solid rgba(255,255,255,0.07)'}}>
          {[['Income',fmt(data.income),'#00b894'],['Saved',fmt(data.savings_target),'#a29bfe'],['Rate',data.savings_rate+'%','#fdcb6e']].map(([l,v,c])=>(
            <div key={l} className="text-center"><p className="text-sm font-medium" style={{color:c}}>{v}</p><p className="text-white/25 text-xs mt-0.5 uppercase tracking-wide">{l}</p></div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="rounded-xl p-4" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Daily spend</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={data.daily_spend} barSize={5} margin={{top:0,right:0,left:0,bottom:0}}>
              <Bar dataKey="total" radius={[2,2,0,0]}>{data.daily_spend.map((_,i)=><Cell key={i} fill={i===data.daily_spend.length-1?'#6c5ce7':'rgba(255,255,255,0.1)'}/>)}</Bar>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{background:'#13131f',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:11,color:'#f0f0fa'}} cursor={false}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.15}} className="rounded-xl p-4" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">By category</p>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={70} height={70}>
              <PieChart><Pie data={data.by_category} cx="50%" cy="50%" innerRadius={22} outerRadius={34} paddingAngle={2} dataKey="total">
                {data.by_category.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} strokeWidth={0}/>)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 flex-1">
              {data.by_category.slice(0,3).map((c,i)=>(
                <div key={c.name} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-white/40"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:COLORS[i]}}/>{c.name}</span>
                  <span className="text-white/60">{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
