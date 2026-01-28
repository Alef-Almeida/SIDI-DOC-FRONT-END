const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8888;

app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÕES ---
const NAPS2_PATH = path.join(__dirname, 'bin', 'NAPS2.Console.exe');
const TEMP_DIR = path.join(__dirname, 'temp');

// Nome do arquivo que será gerado (ou simulado)
const OUTPUT_FILE = path.join(TEMP_DIR, 'scan_result.pdf');

// Garante que a pasta temp existe
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

console.log("------------------------------------------------");
console.log("🖨️  AGENTE DE SCANNER SIDI-DOC INICIADO");
console.log(`📡  Esperando comandos em http://localhost:${PORT}`);
console.log("------------------------------------------------");

app.get('/scan', (req, res) => {
    console.log(">>> Recebido pedido de digitalização...");

    // ============================================================
    // 🔘 MODO DE TESTE (MOCK)
    // Mude para TRUE enquanto não tiver scanner. Mude para FALSE quando conectar o USB.
    // ============================================================
    const MOCK_MODE = true; 

    if (MOCK_MODE) {
        console.log("⚠️  [MOCK ATIVADO] Simulando scanner...");
        
        // Simula o tempo que o scanner levaria (3 segundos)
        setTimeout(() => {
            // Verifica se você colocou o PDF de mentira lá
            if (fs.existsSync(OUTPUT_FILE)) {
                console.log("✅ Scan simulado com sucesso! Enviando arquivo...");
                
                const fileStream = fs.createReadStream(OUTPUT_FILE);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename="scan.pdf"');
                fileStream.pipe(res);
            } else {
                console.error("❌ ERRO MOCK: Arquivo 'scan_result.pdf' não encontrado na pasta temp.");
                console.error("👉 Dica: Copie um PDF qualquer para a pasta /scanner-agent/temp e renomeie para scan_result.pdf");
                
                res.status(500).json({ 
                    error: "Arquivo de simulação não encontrado. Verifique o console do agente." 
                });
            }
        }, 3000);
        
        return; // Encerra aqui se for Mock
    }

    // ============================================================
    // 🔌 MODO REAL (HARDWARE)
    // Esse código só roda se MOCK_MODE = false
    // ============================================================
    
    // Limpa arquivo anterior para não enviar lixo velho
    if (fs.existsSync(OUTPUT_FILE)) {
        try { fs.unlinkSync(OUTPUT_FILE); } catch(e) {}
    }

    const command = `"${NAPS2_PATH}" -o "${OUTPUT_FILE}" --force-overwrite`;
    console.log(`🔨 Executando hardware: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Erro no Scanner: ${error.message}`);
            return res.status(500).json({ 
                error: "Falha ao comunicar com o Scanner.",
                details: stderr 
            });
        }

        if (fs.existsSync(OUTPUT_FILE)) {
            console.log("✅ Digitalização Real concluída!");
            const fileStream = fs.createReadStream(OUTPUT_FILE);
            res.setHeader('Content-Type', 'application/pdf');
            fileStream.pipe(res);
        } else {
            res.status(500).json({ error: "O Scanner terminou, mas nenhum arquivo foi gerado." });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Agente rodando na porta ${PORT}`);
});