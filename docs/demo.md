---
layout: page
title: Simulador Interativo Live — NexoQuiz
---

<script setup>
import { useData } from 'vitepress'
const { site } = useData()
const base = site.value.base || '/'
</script>

<div style="padding: 1rem 0;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
    <div>
      <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0;">Simulador Interativo Live (Apps SDK)</h1>
      <p style="font-size: 0.875rem; color: var(--vp-c-text-2); margin-top: 0.25rem;">
        Experimente o player sóbrio de avaliação do NexoQuiz com questões reais em Modo Estudo e Prova.
      </p>
    </div>
    <a :href="base + 'simulator.html'" target="_blank" style="padding: 0.5rem 1rem; background: var(--vp-c-brand-1); color: #fff; border-radius: 8px; font-size: 0.875rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
      Abrir em Tela Cheia ↗
    </a>
  </div>

  <div style="width: 100%; height: 820px; border: 1px solid var(--vp-c-border); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
    <iframe :src="base + 'simulator.html'" style="width: 100%; height: 100%; border: none;" allow="fullscreen"></iframe>
  </div>
</div>
