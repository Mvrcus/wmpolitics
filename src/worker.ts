import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { runTrackRecordSync } from './lib/track-record/sync';

export function createExports(manifest: SSRManifest) {
	const app = new App(manifest);
	return {
		default: {
			async fetch(request, env, ctx) {
				// Two copies of the workers Request type disagree on details;
				// runtime shape is identical.
				return handle(manifest, app, request as never, env as never, ctx as never);
			},
			async scheduled(_controller, env, ctx) {
				ctx.waitUntil(runTrackRecordSync(env));
			},
		} satisfies ExportedHandler<Env>,
	};
}
