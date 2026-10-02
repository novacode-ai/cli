#!/usr/bin/env node
import 'dotenv/config';
import { NovaAgent } from '@novacode-ai/engine';
import { ChatBox, Theme, StreamRenderer } from '@novacode-ai/ui';
import { LOGO } from './logo.js';
import os from 'os';

const COMMANDS = ['/model', '/clear', '/help', '/exit', '/quit'];

function printBanner(model: string) {
    const cwd = process.cwd().replace(os.homedir(), '~');
    const logoLines = LOGO.split('\n');
    const statsLines = [
        Theme.text.bold('v1.0.0'),
        Theme.primary('❖ ' + model),
        Theme.secondary('⌂ ' + cwd)
    ];

    const cols = process.stdout.columns || 80;
    
    console.log();
    const maxLines = Math.max(logoLines.length, statsLines.length);
    for (let i = 0; i < maxLines; i++) {
        const lLine = logoLines[i] || ' '.repeat(12);
        const sLine = i >= 1 && i - 1 < statsLines.length ? statsLines[i - 1] : '';
        const gapSize = Math.max(2, Math.floor(cols * 0.05));
        console.log(`  ${lLine}${' '.repeat(gapSize)}${sLine}`);
    }
    console.log();
}

async function run() {
    let activeModel = 'gpt-4o';
    const agent = new NovaAgent();
    const chatbox = new ChatBox(COMMANDS);

    console.clear();
    printBanner(activeModel);

    if (!process.env.OPENAI_API_KEY) {
        const w = Math.max(30, Math.min(Math.floor((process.stdout.columns || 80) * 0.9), 100));
        console.log(Theme.border(' ╭' + '─'.repeat(w) + '╮'));
        console.log(Theme.border(' │ ') + '⚠️  Warning: OPENAI_API_KEY is not set');
        console.log(Theme.border(' ╰' + '─'.repeat(w) + '╯\n'));
    }

    while (true) {
        const line = await chatbox.ask();
        if (!line) continue;

        if (line.startsWith('/')) {
            const cmd = line.split(' ')[0].toLowerCase();
            if (cmd === '/exit' || cmd === '/quit') break;
            if (cmd === '/clear') {
                console.clear();
                printBanner(activeModel);
                continue;
            }
            console.log(Theme.secondary('⚙ System: ') + Theme.text(`Command ${cmd} not fully wired yet.\n`));
            continue;
        }

        console.log(Theme.primary.bold('◇ Nova Code'));
        try {
            const result = await agent.ask(line, activeModel);
            const renderer = new StreamRenderer();
            
            // Pass the FULL stream to the UI renderer to handle text AND tool spinners!
            await renderer.render(result.fullStream);
            
            console.log('\n');
        } catch (error: any) {
            console.log(Theme.border(' ❌ API Error: ') + Theme.text(error.message + '\n'));
        }
    }

    chatbox.close();
    process.exit(0);
}

run();
