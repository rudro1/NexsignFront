// import * as React from "react"

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange);
//   }, [])

//   return !!isMobile
// }

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // ১. ইনিশিয়াল স্টেট false রাখা ভালো যাতে SSR এ এরর না দেয়
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // ২. উইন্ডো অবজেক্ট চেক করা (Safety Check)
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // ৩. ইভেন্ট লিসেনার ফাংশন
    const onChange = (e) => {
      // e.matches সরাসরি ব্যবহার করা বেশি সাশ্রয়ী (innerWidth এর চেয়ে)
      setIsMobile(e.matches)
    }

    // ৪. লিসেনার সেটআপ
    mql.addEventListener("change", onChange)
    
    // ৫. ফার্স্ট টাইম চেক
    setIsMobile(mql.matches)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}