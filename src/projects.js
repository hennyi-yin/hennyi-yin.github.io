export const completedProjects = [
  {
    title: 'LLM Post-Training & Efficient Serving',
    category: 'Independent experiment · October 2026',
    description: 'A reproducible Qwen2.5-1.5B study combining LoRA SFT, GRPO with verifiable rewards, vLLM serving, and GPTQ quantization on one 12 GB GPU.',
    technologies: ['PyTorch', 'TRL', 'LoRA', 'GRPO', 'vLLM', 'GPTQ'],
    metrics: [['11.18×', 'Offline throughput vs best HF batch'], ['2.70×', 'Smaller weight files · W4A16'], ['9,095', 'Saved final test answers']],
    resultNote: 'GSM8K: base 68.99%, SFT → GRPO 63.91%, no-SFT GRPO 74.37%. The no-SFT gain is concentrated in newly boxed outputs; accuracy on the common boxed subset did not improve.',
    features: [
      'Built a frozen evaluation protocol, dev-only checkpoint selection, a matched no-SFT ablation, and paired statistical analysis on GSM8K and MATH-500.',
      'Decomposed the no-SFT GSM8K gain of 5.38 pp: newly boxed outputs contributed +6.14 pp, while the common boxed subset contributed −0.76 pp. This is a descriptive result, not proof of improved reasoning.',
      'Measured offline and online serving, TTFT/TPOT, and a W4A16 GSM8K accuracy cost of 8.95 pp; released seven model archives with verified checksums.',
    ],
    links: [
      ['Code & results', 'https://github.com/hennyi-yin/llm-reasoning-grpo'],
      ['Models', 'https://github.com/hennyi-yin/llm-reasoning-grpo/releases/tag/v1.0.0'],
      ['Format analysis', 'https://github.com/hennyi-yin/llm-reasoning-grpo#format-breakdown-where-the-gsm8k-gain-occurs'],
    ],
  },
  {
    title: 'MONAI Brain Extraction Benchmark',
    category: 'Independent experiment · October 2026',
    description: 'A reproducible 3D U-Net brain-extraction benchmark on native T1w MRI, with fixed FSL BET baselines, subject-level metrics, and visual quality checks.',
    technologies: ['Python', 'PyTorch', 'MONAI', 'FSL', 'NiBabel', '3D U-Net'],
    metrics: [['0.9863', 'Mean held-out Dice'], ['25', 'Held-out NFBS scans'], ['100', 'Released prediction masks']],
    resultNote: 'Test Dice: 0.9863 ± 0.0018. The post-hoc robustfov + BET baseline reaches 0.9178. Results cover one dataset; external generalization has not been established.',
    features: [
      'Trained and evaluated a MONAI 3D U-Net using a fixed 85/15/25 subject split and validation-only checkpoint selection.',
      'Compared fixed uncropped BET settings and a separately labeled post-hoc neck-cropping baseline, retaining failure cases and native-grid geometry checks.',
      'Released verified weights, 100 prediction masks, dependency locks, and audit files; reproduced the audits from a clean clone and downloaded release assets.',
    ],
    links: [
      ['Code & results', 'https://github.com/hennyi-yin/monai-brain-extraction'],
      ['Weights & masks', 'https://github.com/hennyi-yin/monai-brain-extraction/releases/tag/v1.1.1'],
      ['Reproduce', 'https://github.com/hennyi-yin/monai-brain-extraction/blob/main/docs/reproduce.md'],
    ],
  },
];
