const fs = require('fs');

let content = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// Replace the title rendering block again to fine-tune the pop-up and Netflix effect
let titleBlockStart = content.indexOf('<motion.h1');
let titleBlockEnd = content.indexOf('</motion.h1>') + '</motion.h1>'.length;

let newTitleBlock = `<motion.h1
            initial="hidden"
            animate="visible"
            className="text-7xl md:text-8xl tracking-tight text-slate-900 dark:text-white select-none pointer-events-none pb-2 text-center flex items-center justify-center w-full"
            style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900 }}
          >
            {/* The "border" the title must not go past - overflow-hidden creates this hard line effect */}
            <div className="flex items-baseline justify-center overflow-hidden px-4 pt-6 pb-2">
              {[
                { char: 'L' },
                { char: 'i', greenDot: true },
                { char: 'S' },
                { char: 'T' },
                { char: 'A' }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="relative inline-flex items-baseline justify-center"
                  initial={{ y: '100%', scale: 1.2 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.7, 
                    ease: [0.16, 1, 0.3, 1], 
                    delay: 0.1 + index * 0.08 
                  }}
                >
                  <div className="relative flex items-baseline justify-center">
                    {item.greenDot && (
                      <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: "spring", delay: 0.1 + index * 0.08 + 0.4 }}
                        className="absolute bottom-[0.8em] left-1/2 -translate-x-1/2 w-[0.24em] h-[0.24em] bg-[#10C86E] rounded-full"
                      ></motion.span>
                    )}
                    <span className="leading-none">
                      {item.char === 'i' ? 'ı' : item.char}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.h1>`;

content = content.substring(0, titleBlockStart) + newTitleBlock + content.substring(titleBlockEnd);
fs.writeFileSync('src/components/LoginScreen.tsx', content);
