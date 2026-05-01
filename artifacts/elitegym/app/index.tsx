import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
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

const ALL_FEATURES = [
  "Accès salle complète",
  "Cours collectifs",
  "Vestiaires & douches",
  "Suivi basique",
  "Accès illimité",
  "Cours illimités",
  "Séances coaching",
  "Suivi performance",
  "Coaching personnalisé",
  "Plan nutrition",
  "Suivi complet",
  "Priorité réservation",
];

function SectionLabel({ text, colors }: { text: string; colors: any }) {
  return (
    <View style={sLabel.wrap}>
      <View style={[sLabel.line, { backgroundColor: colors.primary }]} />
      <Text style={[sLabel.text, { color: colors.primary }]}>{text.toUpperCase()}</Text>
      <View style={[sLabel.line, { backgroundColor: colors.primary }]} />
    </View>
  );
}

const sLabel = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 8 },
  line: { height: 1, width: 40, opacity: 0.5 },
  text: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
});

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ─── HEADER: logo + CTA only, no nav links ─── */}
      <View style={[styles.header, { paddingTop: isWeb ? 0 : insets.top, backgroundColor: "rgba(15,20,35,0.97)", borderBottomColor: "rgba(255,255,255,0.07)" }]}>
        <View style={styles.headerInner}>
          {/* Logo */}
          <View style={styles.headerLogo}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>EG</Text>
            </View>
            <View>
              <Text style={styles.appName}>EliteGym</Text>
              {isWeb && <Text style={styles.appCity}>Béjaïa · Algérie</Text>}
            </View>
          </View>

          {/* Right side */}
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Feather name="log-in" size={14} color="#fff" />
            <Text style={styles.loginBtnText}>Espace membre</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* ─── HERO ─── */}
        <View nativeID="hero" style={styles.hero}>
          {/* Dark gradient overlay pattern */}
          <View style={styles.heroBg} />

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Feather name="map-pin" size={12} color="#E63946" />
              <Text style={styles.heroBadgeText}>Salle de sport premium · Béjaïa, Algérie</Text>
            </View>

            <Text style={styles.heroTitle}>Dépassez{"\n"}vos limites</Text>
            <Text style={styles.heroSub}>
              Coachs certifiés, équipements modernes et programmes personnalisés — tout pour atteindre vos objectifs.
            </Text>

            <View style={styles.heroActions}>
              <TouchableOpacity onPress={() => router.push("/login")}
                style={[styles.heroBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.heroBtnText}>Rejoindre EliteGym</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToId("contact")} style={styles.heroBtnOutline}>
                <Text style={styles.heroBtnOutlineText}>Nous contacter</Text>
              </TouchableOpacity>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
              {[
                { val: stats.membres > 0 ? `${stats.membres}+` : "500+", label: "Membres actifs", icon: "users" },
                { val: stats.coachs > 0 ? `${stats.coachs}` : "5", label: "Coachs certifiés", icon: "award" },
                { val: stats.cours_semaine > 0 ? `${stats.cours_semaine}` : "15", label: "Cours/semaine", icon: "calendar" },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Feather name={s.icon as any} size={20} color={colors.primary} />
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Scroll hint */}
          {isWeb && (
            <TouchableOpacity style={styles.scrollHint} onPress={() => scrollToId("planning")}>
              <Feather name="chevrons-down" size={22} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── PLANNING ─── */}
        <View nativeID="planning" style={[styles.section, { backgroundColor: colors.background }]}>
          <SectionLabel text="Planning" colors={colors} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Planning de la semaine</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Filtrez par jour et découvrez les cours disponibles</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayRow}>
            <TouchableOpacity onPress={() => setActiveDay(null)}
              style={[styles.dayChip, !activeDay && { backgroundColor: colors.primary }]}>
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
        <View nativeID="cours" style={[styles.sectionDark, { backgroundColor: "#0f1423" }]}>
          <SectionLabel text="Nos disciplines" colors={{ primary: "#E63946" }} />
          <Text style={[styles.sectionTitle, { color: "#fff" }]}>Des cours pour tous les niveaux</Text>
          <Text style={[styles.sectionSub, { color: "rgba(255,255,255,0.5)" }]}>Musculation, CrossFit, Yoga et bien plus encore</Text>
          <View style={[styles.disciplinesGrid, isWeb && styles.disciplinesGridWeb]}>
            {DISCIPLINES.map((d) => {
              const clr = SPEC_COLORS[d.nom] || "#E63946";
              return (
                <View key={d.nom} style={[styles.disciplineCard, isWeb && styles.disciplineCardWeb, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 }]}>
                  <View style={[styles.disciplineIcon, { backgroundColor: clr + "20" }]}>
                    <Feather name={d.icon} size={20} color={clr} />
                  </View>
                  <Text style={[styles.disciplineNom, { color: "#fff" }]}>{d.nom}</Text>
                  <Text style={[styles.disciplineDesc, { color: "rgba(255,255,255,0.55)" }]}>{d.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── ÉQUIPE ─── */}
        <View nativeID="equipe" style={[styles.section, { backgroundColor: colors.background }]}>
          <SectionLabel text="Notre équipe" colors={colors} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Des coachs certifiés & passionnés</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Des professionnels à votre service pour atteindre vos objectifs</Text>

          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> :
            coachs.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Chargement...</Text>
            ) : isWeb ? (
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
        <View nativeID="abonnements" style={[styles.sectionDark, { backgroundColor: "#f7f7f8" }]}>
          <SectionLabel text="Abonnements" colors={colors} />
          <Text style={[styles.sectionTitle, { color: "#111" }]}>Choisissez votre formule</Text>
          <Text style={[styles.sectionSub, { color: "#666" }]}>Des tarifs adaptés à tous les budgets</Text>

          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> :
            formules.length === 0 ? (
              <Text style={[styles.emptyText, { color: "#888" }]}>Chargement...</Text>
            ) : isWeb ? (
              <View style={[styles.abonnTable, { backgroundColor: "#fff", borderColor: "#e5e7eb" }]}>
                <View style={styles.abonnTableHeader}>
                  <Text style={[styles.abonnTableFeatureHead, { color: "#666" }]}>Fonctionnalités</Text>
                  {formules.map((f: any, i: number) => (
                    <View key={f.id_formule} style={[styles.abonnTableColHead, i === 1 && { backgroundColor: colors.primary }]}>
                      {i === 1 && (
                        <View style={styles.popularTag}>
                          <Text style={styles.popularTagText}>⭐ Populaire</Text>
                        </View>
                      )}
                      <Text style={[styles.abonnColNom, { color: i === 1 ? "#fff" : "#111" }]}>{f.nom}</Text>
                      <View style={styles.abonnPrixRow}>
                        <Text style={[styles.abonnPrix, { color: i === 1 ? "#fff" : colors.primary }]}>
                          {Number(f.tarif).toLocaleString()}
                        </Text>
                        <Text style={[styles.abonnDA, { color: i === 1 ? "rgba(255,255,255,0.7)" : "#888" }]}> DA</Text>
                      </View>
                      <Text style={[styles.abonnDuree, { color: i === 1 ? "rgba(255,255,255,0.7)" : "#888" }]}>
                        / {f.duree_jours} jours
                      </Text>
                    </View>
                  ))}
                </View>
                {ALL_FEATURES.slice(0, Math.max(...formules.map((_: any, i: number) => i === 0 ? 4 : i === 1 ? 5 : 6))).map((feat, idx) => (
                  <View key={feat} style={[styles.abonnFeatureRow, { borderTopColor: "#e5e7eb", backgroundColor: idx % 2 === 0 ? "transparent" : "#f9f9fa" }]}>
                    <Text style={[styles.abonnFeatureText, { color: "#555", flex: 1 }]}>{feat}</Text>
                    {formules.map((_: any, fi: number) => {
                      const has = fi === 0 ? idx < 4 : fi === 1 ? idx < 5 : true;
                      return (
                        <View key={fi} style={[styles.abonnCheckCell, fi === 1 && { backgroundColor: colors.primary + "08" }]}>
                          <Feather name={has ? "check-circle" : "circle"} size={18} color={has ? (fi === 1 ? colors.primary : "#10b981") : "#ddd"} />
                        </View>
                      );
                    })}
                  </View>
                ))}
                <View style={[styles.abonnCtaRow, { borderTopColor: "#e5e7eb" }]}>
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
              <View style={{ gap: 12, paddingHorizontal: 16 }}>
                {formules.map((f: any, i: number) => (
                  <View key={f.id_formule} style={[styles.mobileAbonnCard, i === 1
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1 }]}>
                    {i === 1 && <Text style={styles.mobilePopular}>⭐ Populaire</Text>}
                    <View style={styles.mobileAbonnTop}>
                      <Text style={[styles.mobileAbonnNom, { color: i === 1 ? "#fff" : "#111" }]}>{f.nom}</Text>
                      <View>
                        <Text style={[styles.mobileAbonnPrix, { color: i === 1 ? "#fff" : colors.primary }]}>
                          {Number(f.tarif).toLocaleString()} DA
                        </Text>
                        <Text style={[styles.mobileAbonnDuree, { color: i === 1 ? "rgba(255,255,255,0.7)" : "#888" }]}>
                          {f.duree_jours} jours
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.mobileAbonnDesc, { color: i === 1 ? "rgba(255,255,255,0.85)" : "#666" }]}>
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
        <View nativeID="boutique" style={[styles.section, { backgroundColor: colors.background }]}>
          <SectionLabel text="Boutique" colors={colors} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Équipement & Nutrition</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Tout ce dont vous avez besoin pour performer</Text>
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
        <View nativeID="contact" style={[styles.sectionDark, { backgroundColor: "#0f1423" }]}>
          <SectionLabel text="Contact" colors={{ primary: "#E63946" }} />
          <Text style={[styles.sectionTitle, { color: "#fff" }]}>Venez nous rendre visite</Text>
          <Text style={[styles.sectionSub, { color: "rgba(255,255,255,0.5)" }]}>Nous sommes à Béjaïa, Algérie</Text>
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
                  style={[styles.contactRow, { borderBottomColor: "rgba(255,255,255,0.08)" }]}>
                  <View style={[styles.contactIcon, { backgroundColor: "#E63946" }]}>
                    <Feather name={c.icon} size={17} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactLabel, { color: "rgba(255,255,255,0.45)" }]}>{c.label}</Text>
                    <Text style={[styles.contactVal, { color: "#fff" }]}>{c.val}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {isWeb && (
              <View style={[styles.mapPlaceholder, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}>
                <Feather name="map" size={40} color="rgba(255,255,255,0.2)" />
                <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 10, fontSize: 14 }}>Carte — Béjaïa, Algérie</Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── FOOTER ─── */}
        <View style={[styles.footer, { backgroundColor: "#080d1a", borderTopColor: "rgba(255,255,255,0.06)" }]}>
          <View style={styles.footerTop}>
            <View style={styles.footerBrand}>
              <View style={[styles.logoBox, { backgroundColor: "#E63946" }]}>
                <Text style={styles.logoText}>EG</Text>
              </View>
              <View>
                <Text style={styles.footerBrandName}>EliteGym</Text>
                <Text style={styles.footerBrandCity}>Béjaïa · Algérie</Text>
              </View>
            </View>
            {isWeb && (
              <View style={styles.footerLinks}>
                {[
                  { label: "Planning", id: "planning" },
                  { label: "Disciplines", id: "cours" },
                  { label: "Notre équipe", id: "equipe" },
                  { label: "Abonnements", id: "abonnements" },
                  { label: "Boutique", id: "boutique" },
                  { label: "Contact", id: "contact" },
                ].map((l) => (
                  <TouchableOpacity key={l.id} onPress={() => scrollToId(l.id)}>
                    <Text style={styles.footerLink}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <Text style={styles.footerCopyright}>© 2025 EliteGym · Tous droits réservés</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─ HEADER ─
  header: {
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: isWeb ? 40 : 16,
    paddingVertical: 14,
  },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  appName: { color: "#fff", fontSize: 17, fontWeight: "900" },
  appCity: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ─ HERO ─
  hero: {
    minHeight: isWeb ? 680 : 560,
    backgroundColor: "#0f1423",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBg: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  heroContent: {
    maxWidth: 760,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: isWeb ? 40 : 24,
    paddingVertical: 60,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(230,57,70,0.15)",
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 28,
  },
  heroBadgeText: { color: "#E63946", fontSize: 13, fontWeight: "600" },
  heroTitle: {
    fontSize: isWeb ? 72 : 48,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: isWeb ? 78 : 52,
    marginBottom: 20,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 17,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 36,
    maxWidth: 560,
  },
  heroActions: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
  heroBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  heroBtnOutline: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)", justifyContent: "center" },
  heroBtnOutlineText: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 16 },

  statsRow: { flexDirection: "row", gap: 12, width: "100%", justifyContent: "center" },
  statCard: {
    flex: 1,
    maxWidth: 180,
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  statVal: { color: "#fff", fontSize: 26, fontWeight: "900" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" },

  scrollHint: { position: "absolute", bottom: 24, alignSelf: "center" },

  // ─ SECTIONS ─
  section: { paddingVertical: 72, paddingHorizontal: isWeb ? 40 : 0 },
  sectionDark: { paddingVertical: 72, paddingHorizontal: isWeb ? 40 : 0 },
  sectionTitle: { fontSize: isWeb ? 36 : 28, fontWeight: "900", textAlign: "center", marginBottom: 8, letterSpacing: -0.5 },
  sectionSub: { fontSize: 15, textAlign: "center", marginBottom: 40, paddingHorizontal: 16 },
  emptyText: { textAlign: "center", paddingVertical: 30 },

  // ─ DAY CHIPS ─
  dayScroll: { marginBottom: 20 },
  dayRow: { paddingHorizontal: isWeb ? 0 : 16, gap: 8, paddingVertical: 4 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(0,0,0,0.06)", minWidth: 52 },
  dayChipDay: { fontSize: 11, fontWeight: "600" },
  dayChipNum: { fontSize: 16, fontWeight: "900" },
  dayChipText: { fontSize: 13, fontWeight: "700" },

  // ─ PLANNING TABLE ─
  tableWrapper: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginHorizontal: isWeb ? 0 : 16 },
  tableHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  tableHead: { flex: 1, fontSize: 11, fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", gap: 8, borderTopWidth: 1 },
  tableCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  tableCellText: { flex: 1, fontSize: 13 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  miniBar: { height: 4, borderRadius: 2, flex: 1, overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 2 },
  reserveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: "center" },

  // ─ MOBILE COURS CARDS ─
  mobileCoursCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  mobileCoursTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  mobileCoursTitle: { fontSize: 15, fontWeight: "800", marginBottom: 3 },
  mobileCoursInfo: { fontSize: 12, lineHeight: 18 },
  mobileResBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  // ─ DISCIPLINES ─
  disciplinesGrid: { gap: 12, paddingHorizontal: 16 },
  disciplinesGridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  disciplineCard: { borderRadius: 16, padding: 22, gap: 10, marginBottom: 8 },
  disciplineCardWeb: { width: "30%", margin: "1.5%" as any },
  disciplineIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  disciplineNom: { fontSize: 15, fontWeight: "800" },
  disciplineDesc: { fontSize: 13, lineHeight: 19 },

  // ─ COACHS TABLE ─
  coachsTable: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginHorizontal: isWeb ? 0 : 16 },
  coachsTableHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16 },
  coachsTableRow: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", borderTopWidth: 1 },
  coachCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  coachAvatarSmall: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  coachAvatarText: { fontSize: 13, fontWeight: "900" },
  coachNameCell: { fontSize: 14, fontWeight: "700" },
  specBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  specBadgeText: { fontSize: 12, fontWeight: "700" },

  // ─ MOBILE COACH CARDS ─
  mobileCoachCard: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 14 },
  coachAvatarMobile: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  coachAvatarMobileText: { fontSize: 18, fontWeight: "900" },

  // ─ ABONNEMENTS ─
  abonnTable: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginHorizontal: isWeb ? 0 : 16 },
  abonnTableHeader: { flexDirection: "row" },
  abonnTableFeatureHead: { flex: 1, padding: 20, fontSize: 13, fontWeight: "700" },
  abonnTableColHead: { flex: 1, padding: 20, alignItems: "center", gap: 4 },
  popularTag: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  popularTagText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  abonnColNom: { fontSize: 16, fontWeight: "800" },
  abonnPrixRow: { flexDirection: "row", alignItems: "flex-end" },
  abonnPrix: { fontSize: 28, fontWeight: "900" },
  abonnDA: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  abonnDuree: { fontSize: 12 },
  abonnFeatureRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1 },
  abonnFeatureText: { padding: 14, fontSize: 13 },
  abonnCheckCell: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  abonnCtaRow: { flexDirection: "row", borderTopWidth: 1, padding: 16, gap: 12 },
  abonnCta: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10 },

  // ─ MOBILE ABONNEMENTS ─
  mobileAbonnCard: { borderRadius: 16, padding: 20, gap: 12 },
  mobilePopular: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  mobileAbonnTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  mobileAbonnNom: { fontSize: 20, fontWeight: "900" },
  mobileAbonnPrix: { fontSize: 22, fontWeight: "900", textAlign: "right" },
  mobileAbonnDuree: { fontSize: 12, textAlign: "right" },
  mobileAbonnDesc: { fontSize: 13, lineHeight: 20 },
  mobileAbonnBtn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },

  // ─ BOUTIQUE ─
  boutiqueGrid: { gap: 12, paddingHorizontal: 16 },
  boutiqueGridWeb: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 0 },
  boutiqueCard: { borderRadius: 14, borderWidth: 1, padding: 18, gap: 8, alignItems: "flex-start", marginBottom: 8 },
  boutiqueCardWeb: { width: "30%", margin: "1.5%" as any },
  boutiqueIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  boutiqueNom: { fontSize: 14, fontWeight: "700" },
  boutiquePrix: { fontSize: 15, fontWeight: "900" },
  boutiqueNote: { textAlign: "center", fontSize: 13, marginTop: 20, paddingHorizontal: 16 },

  // ─ CONTACT ─
  contactGrid: { gap: 20, paddingHorizontal: isWeb ? 0 : 16 },
  contactGridWeb: { flexDirection: "row", gap: 40 },
  contactLeft: { flex: 1, gap: 4 },
  contactRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  contactIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  contactVal: { fontSize: 14, marginTop: 2, lineHeight: 20 },
  mapPlaceholder: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─ FOOTER ─
  footer: { borderTopWidth: 1, paddingVertical: 32, paddingHorizontal: isWeb ? 40 : 24 },
  footerTop: { flexDirection: isWeb ? "row" : "column", justifyContent: "space-between", alignItems: isWeb ? "center" : "flex-start", marginBottom: 24, gap: 20 },
  footerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  footerBrandName: { color: "#fff", fontSize: 15, fontWeight: "900" },
  footerBrandCity: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  footerLinks: { flexDirection: "row", flexWrap: "wrap", gap: 20, justifyContent: "flex-end" },
  footerLink: { color: "rgba(255,255,255,0.45)", fontSize: 13 },
  footerCopyright: { color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center" },
});
