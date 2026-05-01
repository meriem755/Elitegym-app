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

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const BOUTIQUE = [
  { nom: "Gants de Musculation", prix: 1500, icon: "shield" },
  { nom: "Ceinture de Force", prix: 2800, icon: "anchor" },
  { nom: "Shaker 700ml", prix: 800, icon: "droplet" },
  { nom: "Whey Protéine 1kg", prix: 4500, icon: "zap" },
  { nom: "T-Shirt EliteGym", prix: 1200, icon: "tag" },
  { nom: "Serviette de Sport", prix: 700, icon: "wind" },
];

const SPEC_COLORS: Record<string, string> = {
  "Musculation & Force": "#E63946",
  "CrossFit & HIIT": "#f59e0b",
  "Yoga & Bien-être": "#10b981",
  "Cardio & Zumba": "#8b5cf6",
  "Boxe & Arts Martiaux": "#3b82f6",
};

export default function LandingPage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [cours, setCours] = useState<any[]>([]);
  const [coachs, setCoachs] = useState<any[]>([]);
  const [formules, setFormules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/cours/week").catch(() => []),
      api.get("/coachs").catch(() => []),
      api.get("/abonnements/formules").catch(() => []),
    ]).then(([c, co, f]) => {
      setCours(c);
      setCoachs(co);
      setFormules(f);
    }).finally(() => setLoading(false));
  }, []);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const filteredCours = activeDay ? cours.filter((c) => c.date_cours?.slice(0, 10) === activeDay) : cours;

  const scrollToSection = (id: string) => {
    // web-only smooth scroll via native id
    if (isWeb && typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const NAV_LINKS = [
    { label: "Planning", id: "planning" },
    { label: "Cours", id: "cours" },
    { label: "Équipe", id: "equipe" },
    { label: "Abonnements", id: "abonnements" },
    { label: "Boutique", id: "boutique" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* NAVBAR */}
      <View
        nativeID="navbar"
        style={[
          styles.navbar,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: Platform.OS === "web" ? 0 : insets.top,
          },
        ]}
      >
        <View style={styles.navInner}>
          <View style={styles.navLogo}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>EG</Text>
            </View>
            <Text style={[styles.appName, { color: colors.foreground }]}>EliteGym</Text>
          </View>

          {isWeb && (
            <View style={styles.navLinks}>
              {NAV_LINKS.map((l) => (
                <TouchableOpacity key={l.id} onPress={() => scrollToSection(l.id)}>
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
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: colors.secondary }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: "rgba(230,57,70,0.3)" }]}>
              <Text style={[styles.heroBadgeText, { color: "#E63946" }]}>🏋️ Salle de sport premium</Text>
            </View>
            <Text style={styles.heroTitle}>Dépassez{"\n"}vos limites</Text>
            <Text style={styles.heroSub}>
              EliteGym — Votre destination sport à Béjaïa. Coachs certifiés, équipements modernes, cours variés.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={[styles.heroBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.heroBtnText}>Rejoindre EliteGym</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => scrollToSection("contact")}
                style={[styles.heroBtnOutline]}
              >
                <Text style={[styles.heroBtnOutlineText]}>Nous contacter</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroStats}>
              {[
                { val: "500+", label: "Membres" },
                { val: "15+", label: "Cours/sem" },
                { val: "5", label: "Coachs" },
              ].map((s) => (
                <View key={s.label} style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{s.val}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION: PLANNING */}
        <Section id="planning" title="Planning de la semaine" subtitle="Retrouvez tous les cours disponibles cette semaine" colors={colors}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
                <TouchableOpacity
                  onPress={() => setActiveDay(null)}
                  style={[styles.dayChip, !activeDay && { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.dayChipText, { color: !activeDay ? "#fff" : colors.mutedForeground }]}>Tous</Text>
                </TouchableOpacity>
                {days.map((d) => {
                  const dateObj = new Date(d + "T12:00:00");
                  const sel = activeDay === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setActiveDay(sel ? null : d)}
                      style={[styles.dayChip, sel && { backgroundColor: colors.primary }]}
                    >
                      <Text style={[styles.dayChipDay, { color: sel ? "#fff" : colors.mutedForeground }]}>
                        {DAYS_FR[dateObj.getDay()]}
                      </Text>
                      <Text style={[styles.dayChipNum, { color: sel ? "#fff" : colors.foreground }]}>
                        {dateObj.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filteredCours.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun cours ce jour</Text>
              ) : (
                <View style={[styles.grid, isWeb && styles.gridWeb]}>
                  {filteredCours.map((c: any) => {
                    const dateObj = new Date(c.date_cours + "T12:00:00");
                    const complet = c.places_restantes === 0;
                    return (
                      <View
                        key={c.id_cours}
                        style={[
                          styles.coursCard,
                          isWeb && styles.coursCardWeb,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                      >
                        <View style={styles.coursCardHeader}>
                          <View style={[styles.coursTypeBadge, { backgroundColor: colors.primary + "20" }]}>
                            <Text style={[styles.coursTypeText, { color: colors.primary }]}>{c.type_cours}</Text>
                          </View>
                          {complet && (
                            <View style={[styles.coursTypeBadge, { backgroundColor: "#ef444420" }]}>
                              <Text style={[styles.coursTypeText, { color: "#ef4444" }]}>Complet</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.coursTitle, { color: colors.foreground }]}>{c.type_cours}</Text>
                        <View style={styles.coursInfoRow}>
                          <Feather name="calendar" size={12} color={colors.mutedForeground} />
                          <Text style={[styles.coursInfoText, { color: colors.mutedForeground }]}>
                            {DAYS_FR[dateObj.getDay()]} {dateObj.getDate()}/{dateObj.getMonth() + 1}
                          </Text>
                        </View>
                        <View style={styles.coursInfoRow}>
                          <Feather name="clock" size={12} color={colors.mutedForeground} />
                          <Text style={[styles.coursInfoText, { color: colors.mutedForeground }]}>
                            {c.heure_debut?.slice(0, 5)} • {c.duree_minutes} min
                          </Text>
                        </View>
                        <View style={styles.coursInfoRow}>
                          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                          <Text style={[styles.coursInfoText, { color: colors.mutedForeground }]}>{c.salle}</Text>
                        </View>
                        <View style={styles.coursInfoRow}>
                          <Feather name="user" size={12} color={colors.mutedForeground} />
                          <Text style={[styles.coursInfoText, { color: colors.mutedForeground }]}>
                            Coach {c.prenom} {c.nom}
                          </Text>
                        </View>
                        <View style={[styles.coursFooter, { borderTopColor: colors.border }]}>
                          <View style={[
                            styles.placesBar,
                            { backgroundColor: colors.muted }
                          ]}>
                            <View style={[
                              styles.placesBarFill,
                              {
                                backgroundColor: complet ? "#ef4444" : colors.primary,
                                width: `${Math.round(((c.capacite_max - c.places_restantes) / c.capacite_max) * 100)}%` as any,
                              }
                            ]} />
                          </View>
                          <Text style={[styles.placesText, { color: colors.mutedForeground }]}>
                            {c.places_restantes}/{c.capacite_max} places
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={[styles.sectionCTA, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.sectionCTAText}>Réserver un cours →</Text>
              </TouchableOpacity>
            </>
          )}
        </Section>

        {/* SECTION: DISCIPLINES / COURS */}
        <View id="cours" nativeID="cours" style={[styles.sectionAlt, { backgroundColor: colors.secondary }]}>
          <View style={[styles.sectionInner]}>
            <Text style={[styles.sectionTitle, { color: "#fff" }]}>Nos disciplines</Text>
            <Text style={[styles.sectionSub, { color: "rgba(255,255,255,0.7)" }]}>
              Une variété de cours pour tous les niveaux
            </Text>
            <View style={[styles.grid, isWeb && styles.gridWeb]}>
              {[
                { icon: "zap", nom: "Musculation & Force", desc: "Développez force et masse musculaire avec nos équipements de pointe." },
                { icon: "activity", nom: "CrossFit & HIIT", desc: "Dépassez vos limites avec des entraînements haute intensité." },
                { icon: "sun", nom: "Yoga & Bien-être", desc: "Retrouvez équilibre et flexibilité grâce au yoga." },
                { icon: "heart", nom: "Cardio & Zumba", desc: "Cardio festif et danse pour perdre des calories en s'amusant." },
                { icon: "shield", nom: "Boxe & Arts Martiaux", desc: "Technique, puissance et discipline." },
                { icon: "refresh-cw", nom: "Pilates & Stretching", desc: "Renforcement en douceur et récupération musculaire." },
              ].map((d) => (
                <View key={d.nom} style={[styles.disciplineCard, isWeb && styles.disciplineCardWeb, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <View style={[styles.disciplineIcon, { backgroundColor: colors.primary }]}>
                    <Feather name={d.icon as any} size={22} color="#fff" />
                  </View>
                  <Text style={[styles.disciplineNom, { color: "#fff" }]}>{d.nom}</Text>
                  <Text style={[styles.disciplineDesc, { color: "rgba(255,255,255,0.65)" }]}>{d.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION: ÉQUIPE */}
        <Section id="equipe" title="Notre équipe de coachs" subtitle="Des professionnels certifiés à votre service" colors={colors}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : coachs.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Chargement...</Text>
          ) : (
            <View style={[styles.grid, isWeb && styles.gridWeb]}>
              {coachs.map((c: any) => {
                const clr = SPEC_COLORS[c.specialite] || colors.primary;
                return (
                  <View key={c.id_coach} style={[styles.coachCard, isWeb && styles.coachCardWeb, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.coachAvatar, { backgroundColor: clr + "20" }]}>
                      <Text style={[styles.coachAvatarText, { color: clr }]}>
                        {c.prenom?.[0]}{c.nom?.[0]}
                      </Text>
                    </View>
                    <Text style={[styles.coachName, { color: colors.foreground }]}>{c.prenom} {c.nom}</Text>
                    <View style={[styles.coachBadge, { backgroundColor: clr + "15" }]}>
                      <Text style={[styles.coachBadgeText, { color: clr }]}>{c.specialite}</Text>
                    </View>
                    <View style={styles.coursInfoRow}>
                      <Feather name="calendar" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.coursInfoText, { color: colors.mutedForeground }]}>
                        Coach depuis {c.date_embauche?.slice(0, 4)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Section>

        {/* SECTION: ABONNEMENTS */}
        <View id="abonnements" nativeID="abonnements" style={[styles.sectionAlt, { backgroundColor: "#f8f0f0" }]}>
          <View style={styles.sectionInner}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Nos abonnements</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Des formules adaptées à vos objectifs et votre budget
            </Text>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={[styles.grid, isWeb && styles.gridWeb]}>
                {formules.map((f: any, i: number) => {
                  const featured = i === 1;
                  return (
                    <View
                      key={f.id_formule}
                      style={[
                        styles.abonnCard,
                        isWeb && styles.abonnCardWeb,
                        featured
                          ? { backgroundColor: colors.primary, transform: isWeb ? [{ scale: 1.04 }] : undefined }
                          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                      ]}
                    >
                      {featured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>⭐ Populaire</Text>
                        </View>
                      )}
                      <Text style={[styles.abonnNom, { color: featured ? "#fff" : colors.foreground }]}>{f.nom}</Text>
                      <View style={styles.abonnPrixRow}>
                        <Text style={[styles.abonnPrix, { color: featured ? "#fff" : colors.primary }]}>
                          {Number(f.tarif).toLocaleString()}
                        </Text>
                        <Text style={[styles.abonnCurrency, { color: featured ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                          {" "}DA
                        </Text>
                      </View>
                      <Text style={[styles.abonnDuree, { color: featured ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                        {f.duree_jours} jours
                      </Text>
                      <Text style={[styles.abonnDesc, { color: featured ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]}>
                        {f.description}
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push("/login")}
                        style={[
                          styles.abonnBtn,
                          { backgroundColor: featured ? "#fff" : colors.primary },
                        ]}
                      >
                        <Text style={[styles.abonnBtnText, { color: featured ? colors.primary : "#fff" }]}>
                          Souscrire
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* SECTION: BOUTIQUE */}
        <Section id="boutique" title="Boutique" subtitle="Équipement, nutrition, vêtements sport" colors={colors}>
          <View style={[styles.grid, isWeb && styles.gridWeb]}>
            {BOUTIQUE.map((p) => (
              <View key={p.nom} style={[styles.prodCard, isWeb && styles.prodCardWeb, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.prodIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name={p.icon as any} size={22} color={colors.primary} />
                </View>
                <Text style={[styles.prodNom, { color: colors.foreground }]}>{p.nom}</Text>
                <Text style={[styles.prodPrix, { color: colors.primary }]}>{p.prix.toLocaleString()} DA</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.boutiqueNote, { color: colors.mutedForeground }]}>
            Commandez en salle ou via l'application après connexion
          </Text>
        </Section>

        {/* SECTION: CONTACT + LOCALISATION */}
        <View id="contact" nativeID="contact" style={[styles.sectionAlt, { backgroundColor: colors.secondary }]}>
          <View style={styles.sectionInner}>
            <Text style={[styles.sectionTitle, { color: "#fff" }]}>Contact & Localisation</Text>
            <Text style={[styles.sectionSub, { color: "rgba(255,255,255,0.7)" }]}>Venez nous rendre visite</Text>

            <View style={[styles.contactGrid, isWeb && styles.contactGridWeb]}>
              {/* Contact infos */}
              <View style={styles.contactInfos}>
                {[
                  { icon: "map-pin", label: "Adresse", val: "123 Rue de la Sport, Béjaïa, Algérie" },
                  { icon: "phone", label: "Téléphone", val: "+213 23 45 67 89", action: () => Linking.openURL("tel:+213234567890") },
                  { icon: "mail", label: "Email", val: "contact@elitegym.dz", action: () => Linking.openURL("mailto:contact@elitegym.dz") },
                  { icon: "clock", label: "Horaires", val: "Lun – Sam : 6h00 – 22h00\nDimanche : 8h00 – 18h00" },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.label}
                    onPress={c.action}
                    activeOpacity={c.action ? 0.7 : 1}
                    style={[styles.contactRow, { borderBottomColor: "rgba(255,255,255,0.12)" }]}
                  >
                    <View style={[styles.contactIconBox, { backgroundColor: colors.primary }]}>
                      <Feather name={c.icon as any} size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactLabel, { color: "rgba(255,255,255,0.6)" }]}>{c.label}</Text>
                      <Text style={[styles.contactVal, { color: "#fff" }]}>{c.val}</Text>
                    </View>
                    {c.action && <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Map placeholder */}
              <View style={[styles.mapBox, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]}>
                <TouchableOpacity
                  onPress={() => Linking.openURL("https://maps.google.com/?q=Béjaïa+Algérie")}
                  style={styles.mapInner}
                >
                  <Feather name="map" size={40} color="rgba(255,255,255,0.4)" />
                  <Text style={[styles.mapText, { color: "rgba(255,255,255,0.7)" }]}>
                    Béjaïa, Algérie
                  </Text>
                  <View style={[styles.mapBtn, { backgroundColor: colors.primary }]}>
                    <Feather name="navigation" size={14} color="#fff" />
                    <Text style={styles.mapBtnText}>Ouvrir dans Maps</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { backgroundColor: "#0d1b2a", borderTopColor: "rgba(255,255,255,0.08)" }]}>
          <View style={styles.footerInner}>
            <View style={styles.navLogo}>
              <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>EG</Text>
              </View>
              <Text style={[styles.appName, { color: "#fff" }]}>EliteGym</Text>
            </View>
            <Text style={[styles.footerText, { color: "rgba(255,255,255,0.4)" }]}>
              © 2026 EliteGym Béjaïa — Tous droits réservés
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={[styles.footerLogin, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({
  id,
  title,
  subtitle,
  colors,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View id={id} nativeID={id} style={styles.section}>
      <View style={styles.sectionInner}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    borderBottomWidth: 1,
    zIndex: 100,
    ...(isWeb ? ({ position: "sticky", top: 0 } as any) : {}),
  },
  navInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: isWeb ? 48 : 16,
    paddingVertical: 14,
    maxWidth: 1280,
    marginHorizontal: "auto" as any,
    width: "100%",
  },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  logoText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  appName: { fontSize: 18, fontWeight: "900" },
  navLinks: { flexDirection: "row", gap: 28 },
  navLink: { fontSize: 14, fontWeight: "600" },
  loginBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  hero: {
    paddingVertical: isWeb ? 80 : 48,
    paddingHorizontal: isWeb ? 48 : 16,
  },
  heroContent: {
    maxWidth: 720,
    marginHorizontal: "auto" as any,
    alignItems: isWeb ? ("center" as any) : "flex-start",
    gap: 20,
  },
  heroBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  heroBadgeText: { fontSize: 13, fontWeight: "700" },
  heroTitle: {
    color: "#fff",
    fontSize: isWeb ? 56 : 38,
    fontWeight: "900",
    lineHeight: isWeb ? 64 : 46,
    textAlign: isWeb ? "center" : "left",
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: isWeb ? 18 : 15,
    lineHeight: 26,
    textAlign: isWeb ? "center" : "left",
  },
  heroActions: {
    flexDirection: isWeb ? "row" : "column",
    gap: 12,
    alignItems: isWeb ? "center" : "stretch",
    width: "100%",
  },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 10, justifyContent: "center",
  },
  heroBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  heroBtnOutline: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center", alignItems: "center",
  },
  heroBtnOutlineText: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  heroStats: {
    flexDirection: "row", gap: isWeb ? 40 : 24,
    paddingTop: 8, alignSelf: isWeb ? "center" : "flex-start",
  },
  heroStat: { alignItems: "center" },
  heroStatVal: { color: "#E63946", fontSize: 28, fontWeight: "900" },
  heroStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13 },

  section: { paddingVertical: isWeb ? 72 : 40 },
  sectionAlt: { paddingVertical: isWeb ? 72 : 40 },
  sectionInner: {
    paddingHorizontal: isWeb ? 48 : 16,
    maxWidth: 1280,
    marginHorizontal: "auto" as any,
    width: "100%",
    gap: 24,
  },
  sectionTitle: { fontSize: isWeb ? 34 : 24, fontWeight: "900", textAlign: isWeb ? "center" : "left" },
  sectionSub: { fontSize: isWeb ? 16 : 14, textAlign: isWeb ? "center" : "left", marginTop: -12 },
  sectionCTA: {
    alignSelf: "center",
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 10, marginTop: 8,
  },
  sectionCTAText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  grid: { gap: 12 },
  gridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  dayRow: { gap: 8, paddingVertical: 4 },
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, alignItems: "center",
    backgroundColor: "#f0f0f0", minWidth: 52,
  },
  dayChipText: { fontWeight: "700", fontSize: 13 },
  dayChipDay: { fontSize: 11, fontWeight: "600" },
  dayChipNum: { fontSize: 16, fontWeight: "800" },

  coursCard: {
    borderRadius: 14, padding: 14, gap: 7, borderWidth: 1,
  },
  coursCardWeb: { width: 260, margin: 6 },
  coursCardHeader: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  coursTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  coursTypeText: { fontSize: 11, fontWeight: "700" },
  coursTitle: { fontSize: 16, fontWeight: "800" },
  coursInfoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  coursInfoText: { fontSize: 13 },
  coursFooter: { paddingTop: 8, borderTopWidth: 1, gap: 6 },
  placesBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  placesBarFill: { height: "100%", borderRadius: 2 },
  placesText: { fontSize: 12 },

  disciplineCard: {
    borderRadius: 14, padding: 18, gap: 8,
  },
  disciplineCardWeb: { width: 260, margin: 6 },
  disciplineIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  disciplineNom: { fontSize: 16, fontWeight: "800" },
  disciplineDesc: { fontSize: 13, lineHeight: 20 },

  coachCard: {
    borderRadius: 14, padding: 18, gap: 8, borderWidth: 1,
    alignItems: "center",
  },
  coachCardWeb: { width: 200, margin: 6 },
  coachAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  coachAvatarText: { fontSize: 22, fontWeight: "800" },
  coachName: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  coachBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  coachBadgeText: { fontSize: 11, fontWeight: "700", textAlign: "center" },

  abonnCard: { borderRadius: 18, padding: 24, gap: 10 },
  abonnCardWeb: { width: 280, margin: 8 },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  featuredBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  abonnNom: { fontSize: 22, fontWeight: "900" },
  abonnPrixRow: { flexDirection: "row", alignItems: "flex-end" },
  abonnPrix: { fontSize: 36, fontWeight: "900" },
  abonnCurrency: { fontSize: 16, paddingBottom: 5 },
  abonnDuree: { fontSize: 14 },
  abonnDesc: { fontSize: 13, lineHeight: 20 },
  abonnBtn: {
    marginTop: 4, paddingVertical: 13,
    borderRadius: 10, alignItems: "center",
  },
  abonnBtnText: { fontWeight: "700", fontSize: 15 },

  prodCard: {
    borderRadius: 14, padding: 16, gap: 8, borderWidth: 1,
    alignItems: "center",
  },
  prodCardWeb: { width: 180, margin: 6 },
  prodIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  prodNom: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  prodPrix: { fontSize: 16, fontWeight: "800" },
  boutiqueNote: { textAlign: "center", fontSize: 13, marginTop: 8 },

  contactGrid: { gap: 20 },
  contactGridWeb: { flexDirection: "row", gap: 40 },
  contactInfos: { gap: 0, flex: 1 },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 16, borderBottomWidth: 1,
  },
  contactIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, marginBottom: 2 },
  contactVal: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  mapBox: {
    flex: 1, borderRadius: 16, borderWidth: 1, minHeight: 220,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  mapInner: { alignItems: "center", gap: 14, padding: 30 },
  mapText: { fontSize: 16, fontWeight: "600" },
  mapBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  mapBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  footer: {
    borderTopWidth: 1,
    paddingVertical: 30, paddingHorizontal: isWeb ? 48 : 16,
  },
  footerInner: {
    maxWidth: 1280, marginHorizontal: "auto" as any,
    flexDirection: isWeb ? "row" : "column",
    alignItems: "center", gap: 16,
    justifyContent: "space-between",
  },
  footerText: { fontSize: 13 },
  footerLogin: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },

  emptyText: { textAlign: "center", fontSize: 14, paddingVertical: 20 },
});
