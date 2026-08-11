import React from 'react';
import { motion } from 'framer-motion';
export function HowItWorksSection() {
  const steps = [
  {
    number: '01',
    title: 'Upload Your PDF',
    description: 'Upload any PDF document to the secure platform in seconds.'
  },
  {
    number: '02',
    title: 'Place Signature Box',
    description:
    'Drag and position the signature area exactly where you need it.'
  },
  {
    number: '03',
    title: 'Share Signing Link',
    description:
    'Send the unique secure link to your client via email or direct message.'
  },
  {
    number: '04',
    title: 'Signed & Delivered',
    description:
    'Client signs digitally, and the PDF is saved and emailed automatically.'
  }];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-50 relative overflow-hidden dark:bg-[#020617]">

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 dark:text-white">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-400">
            Get your documents signed in four simple steps. No technical skills
            required.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) =>
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.5
              }}
              className="relative flex flex-col items-center text-center">

                <div className="w-24 h-24 rounded-full bg-white border-4 border-sky-100 flex items-center justify-center mb-6 shadow-sm z-10">
                  <span className="text-3xl font-bold text-sky-500">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-400">{step.description}</p>

                {/* Connecting Line (Mobile/Tablet vertical) */}
                {index < steps.length - 1 &&
              <div className="lg:hidden absolute top-24 bottom-[-48px] left-1/2 w-0.5 bg-slate-200 -z-10" />
              }
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}