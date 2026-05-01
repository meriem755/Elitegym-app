import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const isWeb = Platform.OS === "web";
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const SPEC_COLORS: Record<string, string> = {
  "Musculation & Force": "#E63946",
  "CrossFit & HIIT": "#f59e0b",
  "Yoga & Bien-être": "#10b981",
  "Cardio & Zumba": "#8b5cf6",
  "Boxe & Arts Martiaux": "#3b82f6",
};

const DISCIPLINES = [
  { icon: "zap" as const, nom: "Musculation & Force", desc: "Développez force et masse musculaire avec nos équipements de pointe." },
  { icon: "activity" as const, nom: "CrossFit & HIIT", desc: "Dépassez vos limites avec des entraînements haute intensité." },
  { icon: "sun" as const, nom: "Yoga & Bien-être", desc: "Retrouvez équilibre et flexibilité grâce au yoga." },
  { icon: "heart" as const, nom: "Cardio & Zumba", desc: "Cardio festif et danse pour perdre des calories en s'amusant." },
  { icon: "shield" as const, nom: "Boxe & Arts Martiaux", desc: "Technique, puissance et discipline." },
  { icon: "refresh-cw" as const, nom: "Pilates & Stretching", desc: "Renforcement en douceur et récupération musculaire." },
];

const BOUTIQUE = [
  { nom: "Gants de Musculation", prix: 1500, icon: "shield" as const },
  { nom: "Ceinture de Force", prix: 2800, icon: "anchor" as const },
  { nom: "Shaker 700ml", prix: 800, icon: "droplet" as const },
  { nom: "Whey Protéine 1kg", prix: 4500, icon: "zap" as const },
  { nom: "T-Shirt EliteGym", prix: 1200, icon: "tag" as const },
  { nom: "Serviette de Sport", prix: 700, icon: "wind" as const },
];

const FORMULE_FEATURES: Record<string, string[]> = {
  "Mensuel": ["Accès salle complète", "5 cours collectifs/mois", "Vestiaires & douches", "Suivi basique"],
  "Trimestriel": ["Accès illimité", "Cours illimités", "2 séances coaching", "Vestiaires & douches", "Suivi performance"],
  "Annuel": ["Accès illimité", "Cours illimités", "Coaching personnalisé", "Plan nutrition", "Suivi complet", "Priorité réservation"],
};

export default function LandingPage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [cours, setCours] = useState<any[]>([]);
  const [coachs, setCoachs] = useState<any[]>([]);
  const [formules, setFormules] = useState<any[]>([]);
  const [stats, setStats] = useState({ membres: 500, coachs: 5, cours_semaine: 15, abonnements_actifs: 120 });
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/cours/week").catch(() => []),
      api.get("/coachs").catch(() => []),
      api.get("/abonnements/formules").catch(() => []),
      api.get("/stats").catch(() => null),
    ]).then(([c, co, f, s]) => {
      setCours(c || []);
      setCoachs(co || []);
      setFormules(f || []);
      if (s) setStats(s);
    }).finally(() => setLoading(false));
  }, []);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const filteredCours = activeDay ? cours.filter((c) => c.date_cours?.slice(0, 10) === activeDay) : cours;

  const scrollToId = (id: string) => {
    if (isWeb && typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const NAV = [
    { label: "Planning", id: "planning" },
    { label: "Cours", id: "cours" },
    { label: "Équipe", id: "equipe" },
    { label: "Abonnements", id: "abonnements" },
    { label: "Boutique", id: "boutique" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ─── NAVBAR ─── */}
      <View
        nativeID="navbar"
        style={[
          styles.navbar,
          { backgroundColor: colors.card, borderBottomColor: colors.border,
            paddingTop: isWeb ? 0 : insets.top },
        ]}
      >
        <View style={styles.navInner}>
          <TouchableOpacity style={styles.navLogo} onPress={() => scrollToId("hero")}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>EG</Text>
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.foreground }]}>EliteGym</Text>
              {isWeb && <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>Béjaïa · Algérie</Text>}
            </View>
          </TouchableOpacity>

          {isWeb && (
            <View style={styles.navLinks}>
              {NAV.map((l) => (
                <TouchableOpacity key={l.id} onPress={() => scrollToId(l.id)}>
                  <Text style={[styles.navLink, { color: colors.mutedForeground }]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="log-in" size={14} color="#fff" />
            <Text style={styles.loginBtnText}>Espace membre</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ─── HERO ─── */}
        <View nativeID="hero" style={[styles.hero, { backgroundColor: colors.secondary }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: "rgba(230,57,70,0.25)", borderColor: "rgba(230,57,70,0.4)", borderWidth: 1 }]}>
              <Text style={[styles.heroBadgeText, { color: "#E63946" }]}>🏋️ Salle de sport premium · Béjaïa</Text>
            </View>
            <Text style={styles.heroTitle}>Dépassez{"\n"}vos limites</Text>
            <Text style={styles.heroSub}>
              Coachs certifiés, équipements modernes et programmes personnalisés — tout pour atteindre vos objectifs.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity onPress={() => router.push("/login")} style={[styles.heroBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.heroBtnText}>Rejoindre EliteGym</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToId("contact")} style={styles.heroBtnOutline}>
                <Text style={styles.heroBtnOutlineText}>Nous contacter</Text>
              </TouchableOpacity>
            </View>

            {/* STATS FROM DB */}
            <View style={styles.heroStatsRow}>
              {[
                { val: stats.membres > 0 ? `${stats.membres}+` : "500+", label: "Membres actifs", icon: "users" },
                { val: stats.coachs > 0 ? `${stats.coachs}` : "5", label: "Coachs certifiés", icon: "award" },
                { val: stats.cours_semaine > 0 ? `${stats.cours_semaine}` : "15+", label: "Cours/semaine", icon: "calendar" },
              ].map((s) => (
                <View key={s.label} style={[styles.heroStatCard, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <Feather name={s.icon as any} size={18} color="#E63946" />
                  <Text style={styles.heroStatVal}>{s.val}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ─── PLANNING ─── */}
        <View nativeID="planning" style={styles.section}>
          <SectionHeader title="Planning de la semaine" sub="Filtrez par jour et découvrez les cours disponibles" colors={colors} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayRow}>
            <TouchableOpacity onPress={() => setActiveDay(null)} style={[styles.dayChip, !activeDay && { backgroundColor: colors.primary }]}>
              <Text style={[styles.dayChipText, { color: !activeDay ? "#fff" : colors.mutedForeground }]}>Tous</Text>
            </TouchableOpacity>
            {days.map((d) => {
              const dateObj = new Date(d + "T12:00:00");
              const sel = activeDay === d;
              return (
                <TouchableOpacity key={d} onPress={() => setActiveDay(sel ? null : d)}
                  style={[styles.dayChip, sel && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.dayChipDay, { color: sel ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                    {DAYS_FR[dateObj.getDay()]}
                  </Text>
                  <Text style={[styles.dayChipNum, { color: sel ? "#fff" : colors.foreground }]}>
                    {dateObj.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} /> :
            filteredCours.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun cours ce jour</Text>
            ) : isWeb ? (
              /* WEB: table layout */
              <View style={[styles.tableWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.tableHeader, { backgroundColor: colors.secondary }]}>
                  {["Cours", "Jour & Heure", "Durée", "Salle", "Coach", "Places", ""].map((h, i) => (
                    <Text key={i} style={[styles.tableHead, i === 0 && { flex: 2 }]}>{h}</Text>
                  ))}
                </View>
                {filteredCours.map((c: any, idx: number) => {
                  const dateObj = new Date(c.date_cours + "T12:00:00");
                  const complet = c.places_restantes === 0;
                  const pct = Math.round(((c.capacite_max - c.places_restantes) / c.capacite_max) * 100);
                  return (
                    <View key={c.id_cours} style={[styles.tableRow, { borderTopColor: colors.border, backgroundColor: idx % 2 === 0 ? "transparent" : colors.muted + "50" }]}>
                      <View style={[styles.tableCell, { flex: 2, gap: 4 }]}>
                        <View style={[styles.typeDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.tableCellText, { color: colors.foreground, fontWeight: "700" }]}>{c.type_cours}</Text>
                      </View>
                      <Text style={[styles.tableCellText, { color: colors.foreground }]}>
                        {DAYS_FR[dateObj.getDay()]} {dateObj.getDate()}/{dateObj.getMonth() + 1} · {c.heure_debut?.slice(0, 5)}
                      </Text>
                      <Text style={[styles.tableCellText, { color: colors.mutedForeground }]}>{c.duree_minutes} min</Text>
                      <Text style={[styles.tableCellText, { color: colors.mutedForeground }]}>{c.salle}</Text>
                      <Text style={[styles.tableCellText, { color: colors.mutedForeground }]}>{c.prenom} {c.nom}</Text>
                      <View style={styles.tableCell}>
                        <View style={[styles.miniBar, { backgroundColor: colors.muted }]}>
                          <View style={[styles.miniBarFill, { width: `${pct}%` as any, backgroundColor: complet ? "#ef4444" : colors.primary }]} />
                        </View>
                        <Text style={[styles.tableCellText, { color: complet ? "#ef4444" : colors.mutedForeground, fontSize: 11 }]}>
                          {c.places_restantes}/{c.capacite_max}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => router.push("/login")}
                        style={[styles.reserveBtn, { backgroundColor: complet ? colors.muted : colors.primary }]}
                        disabled={complet}>
                        <Text style={{ color: complet ? colors.mutedForeground : "#fff", fontSize: 12, fontWeight: "700" }}>
                          {complet ? "Complet" : "Réserver"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              /* MOBILE: cards */
              <View style={{ gap: 10, paddingHorizontal: 16 }}>
                {filteredCours.map((c: any) => {
                  const complet = c.places_restantes === 0;
                  const dateObj = new Date(c.date_cours + "T12:00:00");
                  return (
                    <View key={c.id_cours} style={[styles.mobileCoursCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={styles.mobileCoursTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.mobileCoursTitle, { color: colors.foreground }]}>{c.type_cours}</Text>
                          <Text style={[styles.mobileCoursInfo, { color: colors.mutedForeground }]}>
                            {DAYS_FR[dateObj.getDay()]} {dateObj.getDate()}/{dateObj.getMonth() + 1} · {c.heure_debut?.slice(0, 5)} · {c.duree_minutes}min
                          </Text>
                          <Text style={[styles.mobileCoursInfo, { color: colors.mutedForeground }]}>
                            {c.salle} · Coach {c.prenom} {c.nom}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/login")}
                          style={[styles.mobileResBtn, { backgroundColor: complet ? colors.muted : colors.primary }]}>
                          <Text style={{ color: complet ? colors.mutedForeground : "#fff", fontSize: 11, fontWeight: "700" }}>
                            {complet ? "Complet" : "Réserver"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.miniBar, { backgroundColor: colors.muted, marginTop: 8 }]}>
                        <View style={[styles.miniBarFill, { width: `${Math.round(((c.capacite_max - c.places_restantes) / c.capacite_max) * 100)}%` as any, backgroundColor: complet ? "#ef4444" : colors.primary }]} />
                      </View>
                      <Text style={[styles.mobileCoursInfo, { color: colors.mutedForeground, marginTop: 4 }]}>
                        {c.places_restantes}/{c.capacite_max} places restantes
                      </Text>
                    </View>
                  );
                })}
              </View>
            )
          }
        </View>

        {/* ─── DISCIPLINES ─── */}
        <View nativeID="cours" style={[styles.sectionDark, { backgroundColor: colors.secondary }]}>
          <SectionHeader title="Nos disciplines" sub="Une variété de cours pour tous les niveaux" colors={colors} dark />
          <View style={[styles.disciplinesGrid, isWeb && styles.disciplinesGridWeb]}>
            {DISCIPLINES.map((d) => (
              <View key={d.nom} style={[styles.disciplineCard, isWeb && styles.disciplineCardWeb, { backgroundColor: "rgba(255,255,255,0.07)" }]}>
                <View style={[styles.disciplineIcon, { backgroundColor: colors.primary }]}>
                  <Feather name={d.icon} size={20} color="#fff" />
                </View>
                <Text style={[styles.disciplineNom, { color: "#fff" }]}>{d.nom}</Text>
                <Text style={[styles.disciplineDesc, { color: "rgba(255,255,255,0.6)" }]}>{d.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── ÉQUIPE ─── */}
        <View nativeID="equipe" style={styles.section}>
          <SectionHeader title="Notre équipe de coachs" sub="Des professionnels certifiés et passionnés" colors={colors} />
          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> :
            coachs.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Chargement...</Text>
            ) : isWeb ? (
              /* WEB: horizontal table-style */
              <View style={[styles.coachsTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.coachsTableHeader, { backgroundColor: colors.secondary }]}>
                  {["Coach", "Spécialité", "En poste depuis"].map((h) => (
                    <Text key={h} style={styles.tableHead}>{h}</Text>
                  ))}
                </View>
                {coachs.map((c: any, idx: number) => {
                  const clr = SPEC_COLORS[c.specialite] || colors.primary;
                  return (
                    <View key={c.id_coach} style={[styles.coachsTableRow, { borderTopColor: colors.border, backgroundColor: idx % 2 === 0 ? "transparent" : colors.muted + "50" }]}>
                      <View style={styles.coachCell}>
                        <View style={[styles.coachAvatarSmall, { backgroundColor: clr + "20" }]}>
                          <Text style={[styles.coachAvatarText, { color: clr }]}>{c.prenom?.[0]}{c.nom?.[0]}</Text>
                        </View>
                        <Text style={[styles.coachNameCell, { color: colors.foreground }]}>{c.prenom} {c.nom}</Text>
                      </View>
                      <View style={styles.coachCell}>
                        <View style={[styles.specBadge, { backgroundColor: clr + "15" }]}>
                          <Text style={[styles.specBadgeText, { color: clr }]}>{c.specialite}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCellText, { color: colors.mutedForeground }]}>
                        {c.date_embauche?.slice(0, 4)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              /* MOBILE: cards */
              <View style={{ gap: 10, paddingHorizontal: 16 }}>
                {coachs.map((c: any) => {
                  const clr = SPEC_COLORS[c.specialite] || colors.primary;
                  return (
                    <View key={c.id_coach} style={[styles.mobileCoachCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={[styles.coachAvatarMobile, { backgroundColor: clr + "20" }]}>
                        <Text style={[styles.coachAvatarMobileText, { color: clr }]}>{c.prenom?.[0]}{c.nom?.[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.mobileCoursTitle, { color: colors.foreground }]}>{c.prenom} {c.nom}</Text>
                        <View style={[styles.specBadge, { backgroundColor: clr + "15", alignSelf: "flex-start", marginTop: 4 }]}>
                          <Text style={[styles.specBadgeText, { color: clr }]}>{c.specialite}</Text>
                        </View>
                        <Text style={[styles.mobileCoursInfo, { color: colors.mutedForeground, marginTop: 4 }]}>Depuis {c.date_embauche?.slice(0, 4)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )
          }
        </View>

        {/* ─── ABONNEMENTS ─── */}
        <View nativeID="abonnements" style={[styles.sectionDark, { backgroundColor: "#f5f0f0" }]}>
          <SectionHeader title="Nos abonnements" sub="Choisissez la formule adaptée à vos objectifs" colors={colors} />

          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> :
            formules.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Chargement...</Text>
            ) : isWeb ? (
              /* WEB: comparison table */
              <View style={[styles.abonnTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header row */}
                <View style={styles.abonnTableHeader}>
                  <Text style={[styles.abonnTableFeatureHead, { color: colors.mutedForeground }]}>Fonctionnalités</Text>
                  {formules.map((f: any, i: number) => (
                    <View key={f.id_formule} style={[styles.abonnTableColHead, i === 1 && { backgroundColor: colors.primary }]}>
                      {i === 1 && (
                        <View style={styles.popularTag}>
                          <Text style={styles.popularTagText}>⭐ Populaire</Text>
                        </View>
                      )}
                      <Text style={[styles.abonnColNom, { color: i === 1 ? "#fff" : colors.foreground }]}>{f.nom}</Text>
                      <View style={styles.abonnPrixRow}>
                        <Text style={[styles.abonnPrix, { color: i === 1 ? "#fff" : colors.primary }]}>
                          {Number(f.tarif).toLocaleString()}
                        </Text>
                        <Text style={[styles.abonnDA, { color: i === 1 ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}> DA</Text>
                      </View>
                      <Text style={[styles.abonnDuree, { color: i === 1 ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                        / {f.duree_jours} jours
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Feature rows */}
                {(FORMULE_FEATURES[formules[1]?.nom] || FORMULE_FEATURES["Trimestriel"]).map((feat, idx) => (
                  <View key={feat} style={[styles.abonnFeatureRow, { borderTopColor: colors.border, backgroundColor: idx % 2 === 0 ? "transparent" : colors.muted + "40" }]}>
                    <Text style={[styles.abonnFeatureText, { color: colors.mutedForeground, flex: 1 }]}>{feat}</Text>
                    {formules.map((f: any, fi: number) => {
                      const features = FORMULE_FEATURES[f.nom] || [];
                      const has = fi === 0 ? idx < 4 : fi === 1 ? idx < 5 : true;
                      return (
                        <View key={f.id_formule} style={[styles.abonnCheckCell, fi === 1 && { backgroundColor: colors.primary + "08" }]}>
                          <Feather name={has ? "check-circle" : "circle"} size={18} color={has ? (fi === 1 ? colors.primary : "#10b981") : colors.border} />
                        </View>
                      );
                    })}
                  </View>
                ))}
                {/* CTA row */}
                <View style={[styles.abonnCtaRow, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }} />
                  {formules.map((f: any, i: number) => (
                    <TouchableOpacity key={f.id_formule} onPress={() => router.push("/login")}
                      style={[styles.abonnCta, { backgroundColor: i === 1 ? colors.primary : "transparent", borderColor: colors.primary, borderWidth: i !== 1 ? 1.5 : 0 }]}>
                      <Text style={{ color: i === 1 ? "#fff" : colors.primary, fontWeight: "700", fontSize: 14 }}>Souscrire</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              /* MOBILE: stacked cards */
              <View style={{ gap: 12, paddingHorizontal: 16 }}>
                {formules.map((f: any, i: number) => (
                  <View key={f.id_formule} style={[styles.mobileAbonnCard, i === 1
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                    {i === 1 && <Text style={styles.mobilePopular}>⭐ Populaire</Text>}
                    <View style={styles.mobileAbonnTop}>
                      <Text style={[styles.mobileAbonnNom, { color: i === 1 ? "#fff" : colors.foreground }]}>{f.nom}</Text>
                      <View>
                        <Text style={[styles.mobileAbonnPrix, { color: i === 1 ? "#fff" : colors.primary }]}>
                          {Number(f.tarif).toLocaleString()} DA
                        </Text>
                        <Text style={[styles.mobileAbonnDuree, { color: i === 1 ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                          {f.duree_jours} jours
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.mobileAbonnDesc, { color: i === 1 ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]}>
                      {f.description}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}
                      style={[styles.mobileAbonnBtn, { backgroundColor: i === 1 ? "#fff" : colors.primary }]}>
                      <Text style={{ color: i === 1 ? colors.primary : "#fff", fontWeight: "700", fontSize: 14 }}>Souscrire</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )
          }
        </View>

        {/* ─── BOUTIQUE ─── */}
        <View nativeID="boutique" style={styles.section}>
          <SectionHeader title="Boutique" sub="Équipement, nutrition et vêtements sport" colors={colors} />
          <View style={[styles.boutiqueGrid, isWeb && styles.boutiqueGridWeb]}>
            {BOUTIQUE.map((p) => (
              <View key={p.nom} style={[styles.boutiqueCard, isWeb && styles.boutiqueCardWeb, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.boutiqueIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name={p.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.boutiqueNom, { color: colors.foreground }]}>{p.nom}</Text>
                <Text style={[styles.boutiquePrix, { color: colors.primary }]}>{p.prix.toLocaleString()} DA</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.boutiqueNote, { color: colors.mutedForeground }]}>
            Commandez en salle ou via l'application après connexion
          </Text>
        </View>

        {/* ─── CONTACT ─── */}
        <View nativeID="contact" style={[styles.sectionDark, { backgroundColor: colors.secondary }]}>
          <SectionHeader title="Contact & Localisation" sub="Venez nous rendre visite à Béjaïa" colors={colors} dark />
          <View style={[styles.contactGrid, isWeb && styles.contactGridWeb]}>
            <View style={styles.contactLeft}>
              {[
                { icon: "map-pin" as const, label: "Adresse", val: "123 Rue de la Sport, Béjaïa, Algérie" },
                { icon: "phone" as const, label: "Téléphone", val: "+213 23 45 67 89", url: "tel:+213234567890" },
                { icon: "mail" as const, label: "Email", val: "contact@elitegym.dz", url: "mailto:contact@elitegym.dz" },
                { icon: "clock" as const, label: "Horaires", val: "Lun – Sam : 6h00 – 22h00\nDimanche : 8h00 – 18h00" },
              ].map((c) => (
                <TouchableOpacity key={c.label} onPress={c.url ? () => Linking.openURL(c.url!) : undefined}
                  activeOpacity={c.url ? 0.7 : 1}
                  style={[styles.contactRow, { borderBottomColor: "rgba(255,255,255,0.1)" }]}>
                  <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}>
                    <Feather name={c.icon} size={17} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactLabel, { color: "rgba(255,255,255,0.55)" }]}>{c.label}</Text>
                    <Text style={[styles.contactVal, { color: "#fff" }]}>{c.val}</Text>
                  </View>
                  {c.url && <Feather name="external-link" size={14} color="rgba(255,255,255,0.35)" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://maps.google.com/?q=Béjaïa+Algérie")}
              style={[styles.mapBox, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }]}>
              <Feather name="map-pin" size={36} color={colors.primary} />
              <Text style={[styles.mapTitle, { color: "#fff" }]}>Béjaïa, Algérie</Text>
              <Text style={[styles.mapSub, { color: "rgba(255,255,255,0.55)" }]}>123 Rue de la Sport</Text>
              <View style={[styles.mapBtn, { backgroundColor: colors.primary }]}>
                <Feather name="navigation" size={13} color="#fff" />
                <Text style={styles.mapBtnText}>Ouvrir dans Google Maps</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── FOOTER ─── */}
        <View style={[styles.footer, { backgroundColor: "#0d1b2a" }]}>
          <View style={[styles.footerInner, isWeb && styles.footerInnerWeb]}>
            <View style={styles.navLogo}>
              <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>EG</Text>
              </View>
              <Text style={[styles.appName, { color: "#fff" }]}>EliteGym</Text>
            </View>
            <Text style={[styles.footerCopy, { color: "rgba(255,255,255,0.35)" }]}>
              © 2026 EliteGym Béjaïa · Tous droits réservés
            </Text>
            <TouchableOpacity onPress={() => router.push("/login")}
              style={[styles.footerLoginBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Espace membre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, sub, colors, dark }: { title: string; sub: string; colors: any; dark?: boolean }) {
  return (
    <View style={[styles.sectionHeader, isWeb && styles.sectionHeaderWeb]}>
      <Text style={[styles.sectionTitle, { color: dark ? "#fff" : colors.foreground }]}>{title}</Text>
      <Text style={[styles.sectionSub, { color: dark ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>{sub}</Text>
    </View>
  );
}

const pad = isWeb ? 48 : 16;
const maxW = 1200;

const styles = StyleSheet.create({
  navbar: {
    borderBottomWidth: 1,
    zIndex: 100,
    ...(isWeb ? ({ position: "sticky", top: 0 } as any) : {}),
  },
  navInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: pad, paddingVertical: 12,
    maxWidth: maxW, marginHorizontal: "auto" as any, width: "100%",
  },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  appName: { fontSize: 17, fontWeight: "900" },
  appTagline: { fontSize: 10, marginTop: -2 },
  navLinks: { flexDirection: "row", gap: 24 },
  navLink: { fontSize: 14, fontWeight: "600" },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  hero: { paddingVertical: isWeb ? 80 : 48, paddingHorizontal: pad },
  heroContent: { maxWidth: 700, marginHorizontal: "auto" as any, alignItems: isWeb ? ("center" as any) : "flex-start", gap: 18 },
  heroBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  heroBadgeText: { fontSize: 13, fontWeight: "700" },
  heroTitle: { color: "#fff", fontSize: isWeb ? 58 : 36, fontWeight: "900", lineHeight: isWeb ? 66 : 44, textAlign: isWeb ? "center" : "left" },
  heroSub: { color: "rgba(255,255,255,0.72)", fontSize: isWeb ? 17 : 15, lineHeight: 25, textAlign: isWeb ? "center" : "left" },
  heroActions: { flexDirection: isWeb ? "row" : "column", gap: 10, width: isWeb ? undefined : "100%" },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 10, justifyContent: "center" },
  heroBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  heroBtnOutline: { paddingHorizontal: 22, paddingVertical: 13, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", alignItems: "center" },
  heroBtnOutlineText: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "600" },
  heroStatsRow: { flexDirection: "row", gap: isWeb ? 12 : 8, width: "100%", justifyContent: "center" },
  heroStatCard: { flex: 1, borderRadius: 12, padding: isWeb ? 16 : 12, alignItems: "center", gap: 6 },
  heroStatVal: { color: "#fff", fontSize: isWeb ? 26 : 20, fontWeight: "900" },
  heroStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: isWeb ? 12 : 10, textAlign: "center" },

  section: { paddingVertical: isWeb ? 64 : 36, gap: 20 },
  sectionDark: { paddingVertical: isWeb ? 64 : 36, gap: 20 },
  sectionHeader: { paddingHorizontal: pad, gap: 6 },
  sectionHeaderWeb: { alignItems: "center", textAlign: "center" } as any,
  sectionTitle: { fontSize: isWeb ? 34 : 22, fontWeight: "900", textAlign: isWeb ? "center" : "left" },
  sectionSub: { fontSize: isWeb ? 16 : 14, textAlign: isWeb ? "center" : "left" },

  dayScroll: { paddingHorizontal: pad },
  dayRow: { gap: 8 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#e8e8e8", minWidth: 52 },
  dayChipText: { fontWeight: "700", fontSize: 13 },
  dayChipDay: { fontSize: 11, fontWeight: "600" },
  dayChipNum: { fontSize: 16, fontWeight: "800" },

  /* Table Planning */
  tableWrapper: { marginHorizontal: pad, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  tableHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16 },
  tableHead: { flex: 1, color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1 },
  tableCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  tableCellText: { flex: 1, fontSize: 13 },
  typeDot: { width: 7, height: 7, borderRadius: 4 },
  miniBar: { height: 5, borderRadius: 3, overflow: "hidden", flex: 1 },
  miniBarFill: { height: "100%", borderRadius: 3 },
  reserveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, alignItems: "center" },

  /* Mobile cours */
  mobileCoursCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 0 },
  mobileCoursTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  mobileCoursTitle: { fontSize: 15, fontWeight: "700" },
  mobileCoursInfo: { fontSize: 12, marginTop: 2 },
  mobileResBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: "center", marginTop: 2 },

  /* Disciplines */
  disciplinesGrid: { paddingHorizontal: pad, gap: 10 },
  disciplinesGridWeb: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  disciplineCard: { borderRadius: 14, padding: 16, gap: 8 },
  disciplineCardWeb: { width: 260, margin: 5 },
  disciplineIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  disciplineNom: { fontSize: 15, fontWeight: "800" },
  disciplineDesc: { fontSize: 13, lineHeight: 19 },

  /* Coaches table */
  coachsTable: { marginHorizontal: pad, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  coachsTableHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16 },
  coachsTableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1 },
  coachCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  coachAvatarSmall: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  coachAvatarText: { fontSize: 13, fontWeight: "800" },
  coachNameCell: { fontSize: 14, fontWeight: "700" },
  specBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  specBadgeText: { fontSize: 11, fontWeight: "700" },

  /* Mobile coaches */
  mobileCoachCard: { borderRadius: 12, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  coachAvatarMobile: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  coachAvatarMobileText: { fontSize: 16, fontWeight: "800" },

  /* Abonnements table */
  abonnTable: { marginHorizontal: pad, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  abonnTableHeader: { flexDirection: "row" },
  abonnTableFeatureHead: { flex: 1, padding: 20, fontSize: 13, fontWeight: "700" },
  abonnTableColHead: { flex: 1, padding: 20, gap: 4, alignItems: "center" },
  popularTag: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  popularTagText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  abonnColNom: { fontSize: 17, fontWeight: "900", textAlign: "center" },
  abonnPrixRow: { flexDirection: "row", alignItems: "flex-end" },
  abonnPrix: { fontSize: 28, fontWeight: "900" },
  abonnDA: { fontSize: 13, paddingBottom: 4 },
  abonnDuree: { fontSize: 12 },
  abonnFeatureRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1 },
  abonnFeatureText: { padding: 14, fontSize: 13 },
  abonnCheckCell: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  abonnCtaRow: { flexDirection: "row", borderTopWidth: 1, padding: 16, gap: 12 },
  abonnCta: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: "center" },

  /* Mobile abonnements */
  mobileAbonnCard: { borderRadius: 14, padding: 18, gap: 10 },
  mobilePopular: { color: "#fff", fontSize: 12, fontWeight: "700", opacity: 0.85 },
  mobileAbonnTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  mobileAbonnNom: { fontSize: 20, fontWeight: "900" },
  mobileAbonnPrix: { fontSize: 22, fontWeight: "900", textAlign: "right" },
  mobileAbonnDuree: { fontSize: 12, textAlign: "right" },
  mobileAbonnDesc: { fontSize: 13, lineHeight: 19 },
  mobileAbonnBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },

  /* Boutique */
  boutiqueGrid: { paddingHorizontal: pad, gap: 10 },
  boutiqueGridWeb: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  boutiqueCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 8, alignItems: "center" },
  boutiqueCardWeb: { width: 170, margin: 5 },
  boutiqueIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  boutiqueNom: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  boutiquePrix: { fontSize: 15, fontWeight: "800" },
  boutiqueNote: { textAlign: "center", fontSize: 12, paddingHorizontal: pad },

  /* Contact */
  contactGrid: { paddingHorizontal: pad, gap: 20 },
  contactGridWeb: { flexDirection: "row", gap: 40 },
  contactLeft: { flex: 1, gap: 0 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  contactIcon: { width: 38, height: 38, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 11, marginBottom: 2 },
  contactVal: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  mapBox: { flex: 1, borderRadius: 16, borderWidth: 1, minHeight: 200, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  mapTitle: { fontSize: 18, fontWeight: "800" },
  mapSub: { fontSize: 13 },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9, marginTop: 6 },
  mapBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  /* Footer */
  footer: { paddingVertical: 28, paddingHorizontal: pad },
  footerInner: { gap: 14, alignItems: "center" },
  footerInnerWeb: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerCopy: { fontSize: 12 },
  footerLoginBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8 },

  emptyText: { textAlign: "center", fontSize: 14, paddingVertical: 24 },
});
