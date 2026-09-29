import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { join } from 'node:path';

export const getMCPTools = async () => {
    const materialsPath = join(process.cwd(), 'data', 'materials');

    const mcpClient = new MultiServerMCPClient({
        materials: {
            transport: 'stdio',
            command: 'npx',
            args: [
                '-y',
                '@modelcontextprotocol/server-filesystem',
                materialsPath,
            ],
        },
    });

    return mcpClient.getTools();
};