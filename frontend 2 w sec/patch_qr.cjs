const fs = require('fs');

let groupQr = fs.readFileSync('src/components/GroupQRScreen.tsx', 'utf8');

// Add import
groupQr = groupQr.replace(
  'import { Copy, Share, ArrowRight } from \'lucide-react\';',
  'import { Copy, Share, ArrowRight } from \'lucide-react\';\nimport QRCode from \'react-qr-code\';'
);

const oldPattern = `<div className="w-44 h-44 bg-white dark:bg-slate-900 grid grid-cols-4 grid-rows-4 gap-1.5 p-3 rounded-xl border border-slate-300/60 dark:border-slate-700/60 shadow-sm">
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className={\`rounded-md transition-all duration-500 \${
                    (i === 0 || i === 3 || i === 12 || i === 15 || i % 3 === 0) 
                      ? 'bg-slate-800 dark:bg-slate-200' 
                      : 'bg-transparent'
                  }\`}
                />
              ))}
            </div>`;

const newPattern = `<div className="w-44 h-44 bg-white grid p-2 rounded-xl shadow-sm mx-auto">
              <QRCode
                value={\`lista.app/join/\${slugifiedName || 'new-group'}\`}
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={\`0 0 160 160\`}
                fgColor="#0f172a"
              />
            </div>`;

if(groupQr.includes('Mock QR Code Pattern')) {
  groupQr = groupQr.replace(oldPattern, newPattern);
  fs.writeFileSync('src/components/GroupQRScreen.tsx', groupQr);
} else {
  console.log("Could not find old pattern in GroupQRScreen.tsx");
}

let groupDetail = fs.readFileSync('src/components/GroupDetailScreen.tsx', 'utf8');

groupDetail = groupDetail.replace(
  'import { ExpenseItem, Split } from \'../types\';',
  'import { ExpenseItem, Split } from \'../types\';\nimport QRCode from \'react-qr-code\';'
);

const oldQrph = `<div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <svg width="120" height="120" viewBox="0 0 100 100" className="text-slate-900">
                      <path d="M10 10h20v20H10zm5 5h10v10H15zM70 10h20v20H70zm5 5h10v10H75zM10 70h20v20H10zm5 5h10v10H15z" fill="currentColor"/>
                      <path d="M40 10h20v5H40zm5 10h5v15h-5zm10-5h5v15h-5zM10 40h20v5H10zm5 10h5v10h-5zm10-5h5v15h-5zM70 40h20v5H70zm5 10h10v5H75zm10 10h5v15h-5zM40 70h20v5H40zm5 10h10v5H45zM50 40h20v20H50zm5 5h10v10H55z" fill="currentColor"/>
                    </svg>
                  </div>`;
                  
const newQrph = `<div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <QRCode
                      value={\`QRPH:\${group.id}:\${youOwe.toFixed(2)}\`}
                      size={120}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={\`0 0 120 120\`}
                      fgColor="#0f172a"
                    />
                  </div>`;

if(groupDetail.includes('Scan to Pay via QRPH')) {
  groupDetail = groupDetail.replace(oldQrph, newQrph);
  fs.writeFileSync('src/components/GroupDetailScreen.tsx', groupDetail);
} else {
  console.log("Could not find old qrph in GroupDetailScreen.tsx");
}

