package com.example.koobnaaba.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.koobnaaba.ui.theme.BurntAmber
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.LightSage
import com.example.koobnaaba.ui.theme.Terracotta
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) }
    val fcfa = remember { NumberFormat.getNumberInstance(Locale.FRANCE) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Calculateur Agronomique") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                edgePadding = 16.dp
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Semis & PMG") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Dose Phyto & Eau") }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("Besoins en Eau (ETc)") }
                )
                Tab(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    text = { Text("Marge & ROI") }
                )
            }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                when (selectedTab) {
                    0 -> item { SeedDensitySection() }
                    1 -> item { SprayDoseSection() }
                    2 -> item { WaterRequirementSection() }
                    3 -> item { MarginRoiSection(fcfa) }
                }
            }
        }
    }
}

@Composable
fun SeedDensitySection() {
    var pmgText by remember { mutableStateOf("25") } // Poids de 1000 grains en grammes
    var grainsM2Text by remember { mutableStateOf("250") } // grains/m²
    var germRateText by remember { mutableStateOf("85") } // % faculté germinative

    val pmg = pmgText.toDoubleOrNull() ?: 25.0
    val grainsM2 = grainsM2Text.toDoubleOrNull() ?: 250.0
    val germRate = (germRateText.toDoubleOrNull() ?: 85.0) / 100.0

    // Formule: (Grains/m² * 10 000 m²/ha * PMG en g) / (1000 * 1000) / (Taux de germination)
    val seedKgPerHa = if (germRate > 0) {
        ((grainsM2 * 10000.0 * pmg) / 1000000.0) / germRate
    } else 0.0

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth().testTag("card_seed_calc")
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                "Calculateur de Quantité de Semences",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                "Déterminez la quantité exacte de graines certifiées nécessaire par hectare selon le Poids de Mille Grains (PMG).",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            OutlinedTextField(
                value = pmgText,
                onValueChange = { pmgText = it },
                label = { Text("PMG (Poids de 1000 grains en grammes)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = grainsM2Text,
                onValueChange = { grainsM2Text = it },
                label = { Text("Densité visée (grains / m²)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = germRateText,
                onValueChange = { germRateText = it },
                label = { Text("Faculté germinative (%)") },
                modifier = Modifier.fillMaxWidth()
            )

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = LightSage,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Dose de semence recommandée",
                        style = MaterialTheme.typography.labelSmall,
                        color = ForestGreenPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "%.2f kg / hectare".format(seedKgPerHa),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = ForestGreenPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        "Soit environ %.1f kg pour un champ de 2.5 ha".format(seedKgPerHa * 2.5),
                        style = MaterialTheme.typography.bodySmall,
                        color = ForestGreenPrimary
                    )
                }
            }
        }
    }
}

@Composable
fun SprayDoseSection() {
    var areaHaText by remember { mutableStateOf("1.5") }
    var dosePerHaText by remember { mutableStateOf("2.0") } // L ou kg / ha
    var sprayVolumePerHaText by remember { mutableStateOf("200") } // L de bouillie / ha

    val area = areaHaText.toDoubleOrNull() ?: 1.0
    val dose = dosePerHaText.toDoubleOrNull() ?: 2.0
    val spray = sprayVolumePerHaText.toDoubleOrNull() ?: 200.0

    val totalProduct = area * dose
    val totalSprayVolume = area * spray
    val sprayerKnapsack16LCount = (totalSprayVolume / 16.0).toInt() + 1

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                "Dosage Produits & Volume de Bouillie",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            OutlinedTextField(
                value = areaHaText,
                onValueChange = { areaHaText = it },
                label = { Text("Superficie à traiter (ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = dosePerHaText,
                onValueChange = { dosePerHaText = it },
                label = { Text("Dose homologuée par hectare (L ou kg/ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = sprayVolumePerHaText,
                onValueChange = { sprayVolumePerHaText = it },
                label = { Text("Volume de bouillie par hectare (L/ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "Résultats de la préparation",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        "• Quantité de produit nécessaire : %.2f L ou kg".format(totalProduct),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "• Eau totale requise : %.0f Litres".format(totalSprayVolume),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "• Nombre de pulvérisateurs (16L) à préparer : environ $sprayerKnapsack16LCount charges",
                        style = MaterialTheme.typography.bodySmall,
                        color = BurntAmber
                    )
                }
            }
        }
    }
}

@Composable
fun WaterRequirementSection() {
    var etoText by remember { mutableStateOf("6.0") } // mm / jour (Sahel)
    var kcText by remember { mutableStateOf("1.05") } // Coeff cultural
    var daysText by remember { mutableStateOf("90") } // Durée du cycle
    var areaHaText by remember { mutableStateOf("1.0") } // ha

    val eto = etoText.toDoubleOrNull() ?: 6.0
    val kc = kcText.toDoubleOrNull() ?: 1.05
    val days = daysText.toDoubleOrNull() ?: 90.0
    val areaHa = areaHaText.toDoubleOrNull() ?: 1.0

    // ETc = ETo * Kc (mm/jour)
    val etcDailyMm = eto * kc
    // Besoin total mm = etcDaily * days
    val totalMm = etcDailyMm * days
    // 1 mm sur 1 ha = 10 m³ d'eau = 10 000 Litres
    val totalM3 = totalMm * areaHa * 10.0

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                "Besoin en Eau des Cultures (ETc)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                "Calcul basé sur la méthode FAO Penman-Monteith simplifiée pour l'irrigation sahélienne.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            OutlinedTextField(
                value = etoText,
                onValueChange = { etoText = it },
                label = { Text("Évapotranspiration de référence ETo (mm/jour)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = kcText,
                onValueChange = { kcText = it },
                label = { Text("Coefficient cultural moyen Kc (ex: 0.9 à 1.15)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = daysText,
                onValueChange = { daysText = it },
                label = { Text("Durée du cycle (jours)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = areaHaText,
                onValueChange = { areaHaText = it },
                label = { Text("Superficie de la parcelle (ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = LightSage,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Volume d'irrigation total", style = MaterialTheme.typography.labelSmall, color = ForestGreenPrimary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "%.0f m³".format(totalM3),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = ForestGreenPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        "Besoin journalier : %.1f m³/jour (%.1f mm/jour)".format(totalM3 / days, etcDailyMm),
                        style = MaterialTheme.typography.bodySmall,
                        color = ForestGreenPrimary
                    )
                }
            }
        }
    }
}

@Composable
fun MarginRoiSection(fcfa: NumberFormat) {
    var yieldPerHaText by remember { mutableStateOf("25000") } // kg/ha (ex: oignon/tomate)
    var areaHaText by remember { mutableStateOf("1.5") }
    var pricePerKgText by remember { mutableStateOf("300") } // FCFA/kg
    var totalCostText by remember { mutableStateOf("1500000") } // FCFA total charges

    val yieldHa = yieldPerHaText.toDoubleOrNull() ?: 0.0
    val area = areaHaText.toDoubleOrNull() ?: 1.0
    val priceKg = pricePerKgText.toDoubleOrNull() ?: 0.0
    val totalCost = totalCostText.toDoubleOrNull() ?: 0.0

    val totalProductionKg = yieldHa * area
    val grossRevenue = totalProductionKg * priceKg
    val netMargin = grossRevenue - totalCost
    val roiPercent = if (totalCost > 0) (netMargin / totalCost) * 100.0 else 0.0

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                "Simulation de Rentabilité & Marge Nette",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            OutlinedTextField(
                value = yieldPerHaText,
                onValueChange = { yieldPerHaText = it },
                label = { Text("Rendement prévisionnel (kg/ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = areaHaText,
                onValueChange = { areaHaText = it },
                label = { Text("Superficie cultivée (ha)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = pricePerKgText,
                onValueChange = { pricePerKgText = it },
                label = { Text("Prix moyen de vente bord-champ (FCFA / kg)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = totalCostText,
                onValueChange = { totalCostText = it },
                label = { Text("Total des charges de production (FCFA)") },
                modifier = Modifier.fillMaxWidth()
            )

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (netMargin >= 0) LightSage else MaterialTheme.colorScheme.errorContainer,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        "Revenu brut estimé : ${fcfa.format(grossRevenue)} FCFA",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        "Marge nette estimée : ${fcfa.format(netMargin)} FCFA",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = if (netMargin >= 0) ForestGreenPrimary else MaterialTheme.colorScheme.error
                    )
                    Text(
                        "Retour sur investissement (ROI) : %.1f %%".format(roiPercent),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = BurntAmber
                    )
                }
            }
        }
    }
}
