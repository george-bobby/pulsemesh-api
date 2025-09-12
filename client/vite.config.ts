import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Force Rollup to use JavaScript fallback instead of native bindings
process.env.ROLLUP_NO_NATIVE = '1';

// https://vitejs.dev/config/
export default defineConfig(() => ({
	server: {
		host: '::',
		port: 8080,
	},
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		rollupOptions: {
			// Additional configuration to ensure stable builds
			external: [],
			output: {
				manualChunks: undefined,
			},
		},
		// Increase chunk size warning limit
		chunkSizeWarningLimit: 1000,
	},
	optimizeDeps: {
		// Pre-bundle these dependencies to avoid issues during build
		include: ['react', 'react-dom'],
		// Force optimization of problematic dependencies
		force: true,
	},
}));
