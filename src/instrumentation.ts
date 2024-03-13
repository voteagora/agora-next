import { registerOTel } from '@vercel/otel'

export const SERVICE_NAME = 'agora-app';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  } else {
    registerOTel({ serviceName: SERVICE_NAME });
  }
}

