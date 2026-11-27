import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { pins, profile } from './src/data/profile'

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Fills the %PROFILE_*% placeholders in index.html from src/data/profile.ts, so the title,
 * description, social cards and structured data always match the page itself.
 */
function profileMeta(): Plugin {
  const site = profile.site.replace(/\/+$/, '')
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.handle,
    jobTitle: profile.role,
    url: `${site}/`,
    sameAs: [profile.links.github, profile.links.telegram].filter(Boolean),
    ...(profile.location ? { homeLocation: { '@type': 'Place', name: profile.location } } : {}),
    knowsAbout: pins.map((p) => p.name),
  }
  const values: Record<string, string> = {
    TITLE: attr(`${profile.handle} · ${profile.role}`),
    DESCRIPTION: attr(profile.lede),
    SITE: attr(site),
    IMAGE_ALT: attr(`${profile.handle}, ${profile.role}`),
    GITHUB: attr(profile.links.github),
    GITHUB_USER: attr(profile.githubUser),
    PERSON: JSON.stringify(person).replace(/</g, '\\u003c'),
  }
  return {
    name: 'profile-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/%PROFILE_(\w+)%/g, (match, key: string) => {
          if (!(key in values)) throw new Error(`index.html: unknown placeholder ${match}`)
          return values[key]
        }),
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), profileMeta()],
})
