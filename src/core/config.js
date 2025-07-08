/**
 * config.js - Configurações básicas
 */

export const SUPABASE_CONFIG = {
    url: 'https://pcvmqnhcybpcgivfwtiv.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm1xbmhjeWJwY2dpdmZ3dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDAzNDEsImV4cCI6MjA2NzQ3NjM0MX0.l7D_roUVnceJEYN-c0GFLVXXdolfCxENvKSQbvaNIsg'
};

export const APP_CONFIG = {
    name: 'Mikael David Portfolio',
    version: '2.0.0'
};

export default {
    supabase: SUPABASE_CONFIG,
    app: APP_CONFIG
};