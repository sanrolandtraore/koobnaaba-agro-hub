package com.example.koobnaaba.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.koobnaaba.data.model.BurkinaCropData
import com.example.koobnaaba.data.model.CropCycle
import com.example.koobnaaba.ui.theme.BurntAmber
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.LightSage
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropsScreen(
    viewModel: KoobnaabaViewModel,
    modifier: Modifier = Modifier
) {
    val cropCycles by viewModel.cropCycles.collectAsState()
    val parcels by viewModel.parcels.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestion des Cultures & Variétés") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            if (selectedTab == 0) {
                FloatingActionButton(
                    onClick = { showAddDialog = true },
                    containerColor = ForestGreenPrimary,
                    contentColor = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.testTag("fab_add_crop_cycle")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Démarrer cycle")
                }
            }
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            TabRow(selectedTabIndex = selectedTab) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Cycles en cours (${cropCycles.size})") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Catalogue Burkina") }
                )
            }

            if (selectedTab == 0) {
                if (cropCycles.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Aucun cycle cultural actif. Appuyez sur + pour démarrer une campagne.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(cropCycles, key = { it.id }) { cycle ->
                            val parcelName = parcels.find { it.id == cycle.parcelId }?.name ?: "Parcelle"
                            CropCycleCard(
                                cycle = cycle,
                                parcelName = parcelName,
                                onDelete = { viewModel.deleteCropCycle(cycle) }
                            )
                        }
                    }
                }
            } else {
                // Burkina Crop Reference Library
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(BurkinaCropData.CROPS) { crop ->
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = CardDefaults.outlinedCardBorder(),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = crop.label,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = LightSage
                                        ) {
                                            Text(
                                                text = crop.group,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = ForestGreenPrimary,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        "Cycle : ${crop.cycleDays} jours • Rendement moyen : ${crop.avgYieldKgPerHa.toInt()} kg/ha",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        "Besoin en eau : ~${crop.waterNeedsMm} mm",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = ForestGreenPrimary
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        if (showAddDialog) {
            AddCropCycleDialog(
                parcels = parcels,
                onDismiss = { showAddDialog = false },
                onConfirm = { parcelId, name, cat, season, plantDate, harvestDate, yieldVal, notes ->
                    viewModel.addCropCycle(parcelId, name, cat, season, plantDate, harvestDate, yieldVal, notes)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
fun CropCycleCard(
    cycle: CropCycle,
    parcelName: String,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = cycle.cropName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "$parcelName • ${cycle.season}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Supprimer", tint = MaterialTheme.colorScheme.error)
                }
            }
            Divider(modifier = Modifier.padding(vertical = 10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Semis", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(cycle.plantingDate, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                }
                Column {
                    Text("Récolte Estimée", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(cycle.expectedHarvestDate, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Rendement Prévu", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${cycle.expectedYieldKg.toInt()} kg", style = MaterialTheme.typography.bodySmall, color = BurntAmber, fontWeight = FontWeight.Bold)
                }
            }
            if (cycle.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = cycle.notes,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddCropCycleDialog(
    parcels: List<com.example.koobnaaba.data.model.Parcel>,
    onDismiss: () -> Unit,
    onConfirm: (Long, String, String, String, String, String, Double, String) -> Unit
) {
    val predefinedCrops = BurkinaCropData.CROPS
    var cropName by remember { mutableStateOf(predefinedCrops.first().label) }
    var selectedParcelId by remember { mutableStateOf(parcels.firstOrNull()?.id ?: 0L) }
    var season by remember { mutableStateOf("Saison sèche fraîche") }
    var plantDate by remember { mutableStateOf("15/10/2026") }
    var harvestDate by remember { mutableStateOf("15/02/2027") }
    var yieldText by remember { mutableStateOf("15000") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouveau Cycle Cultural") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = cropName,
                    onValueChange = { cropName = it },
                    label = { Text("Culture") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = season,
                    onValueChange = { season = it },
                    label = { Text("Saison / Campagne") },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = plantDate,
                        onValueChange = { plantDate = it },
                        label = { Text("Date semis") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = harvestDate,
                        onValueChange = { harvestDate = it },
                        label = { Text("Date récolte") },
                        modifier = Modifier.weight(1f)
                    )
                }
                OutlinedTextField(
                    value = yieldText,
                    onValueChange = { yieldText = it },
                    label = { Text("Rendement attendu (kg)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Remarques agronomiques") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val y = yieldText.toDoubleOrNull() ?: 1000.0
                    onConfirm(selectedParcelId, cropName, "Général", season, plantDate, harvestDate, y, notes)
                },
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
            ) {
                Text("Démarrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
}
