import { motion, type Variants } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

export function Hero() {
  const { t } = useLanguage();

  const stats = [
    t('statTeams'),
    t('statGroups'),
    t('statMatches'),
    t('statDates'),
    t('statHosts'),
  ];

  return (
    <section className="hero">
      <div className="hero-inner">
        <motion.p
          className="hero-eyebrow"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('eyebrow')}
        </motion.p>

        <motion.h1
          className="hero-title"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="hero-lead"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          className="hero-rule"
          custom={3}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
          aria-hidden
        />

        <motion.ul
          className="hero-stats"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {stats.map((stat) => (
            <li key={stat}>{stat}</li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
