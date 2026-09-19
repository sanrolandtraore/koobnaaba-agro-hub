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
import androidx.compose.ui.unit.sp
import com.example.koobnaaba.data.model.Farm
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel

val BURKINA_REGIONS = listOf(
    "Bobo-Dioulasso", "Ouagadougou", "Koudougou", "Banfora", "Ouahigouya",
    "Kaya", "Tenkodogo", "Fada N'Gourma", "Dédougou", "Ziniaré",
    "Manga", "Dori", "Gaoua", "Loumbila", "Komsilga"
)

val CLIMATE_ZONES = listOf(
    "Sahel (Nord)", "Nord-Soudanien (Centre)", "Sud-Soudanien (Sud/Ouest)"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FarmsScreen(
    viewModel: KoobnaabaViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val farms by viewModel.farms.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Exploitations Agricoles") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Retour")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showDialog = true },
                containerColor = ForestGreenPrimary,
                contentColor = MaterialTheme.colorScheme.surface,
                modifier = Modifier.testTag("fab_add_farm")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter exploitation")
            }
        },
        modifier = modifier
    ) { innerPadding ->
        if (farms.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.Landscape,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Aucune exploitation enregistrée",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Appuyez sur le bouton + pour enregistrer votre première ferme.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(farms, key = { it.id }) { farm ->
                    FarmCard(
                        farm = farm,
                        onDelete = { viewModel.deleteFarm(farm) }
                    )
                }
            }
        }

        if (showDialog) {
            AddFarmDialog(
                onDismiss = { showDialog = false },
                onConfirm = { name, location, area, climate, lat, lng ->
                    viewModel.addFarm(name, location, area, climate, lat, lng)
                    showDialog = false
                }
            )
        }
    }
}

@Composable
fun FarmCard(
    farm: Farm,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = farm.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Place,
                            contentDescription = null,
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = farm.locationName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Supprimer",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            Divider(modifier = Modifier.padding(vertical = 12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Superficie", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("%.1f ha".format(farm.totalAreaHa), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                }
                Column {
                    Text("Zone Agro-Climatique", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(farm.climateZone, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                }
                if (farm.latitude != null && farm.longitude != null) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("GPS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("%.3f, %.3f".format(farm.latitude, farm.longitude), style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddFarmDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, Double, String, Double?, Double?) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var location by remember { mutableStateOf(BURKINA_REGIONS.first()) }
    var areaText by remember { mutableStateOf("5.0") }
    var climateZone by remember { mutableStateOf(CLIMATE_ZONES[1]) }
    var isLocating by remember { mutableStateOf(false) }
    var lat by remember { mutableStateOf<Double?>(null) }
    var lng by remember { mutableStateOf<Double?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouvelle Exploitation") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom de la ferme") },
                    placeholder = { Text("Ex: Ferme Agro Sahel") },
                    modifier = Modifier.fillMaxWidth().testTag("input_farm_name")
                )

                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it },
                    label = { Text("Localité / Région") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = areaText,
                    onValueChange = { areaText = it },
                    label = { Text("Superficie totale (Hectares)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Button(
                    onClick = {
                        isLocating = true
                        // Coordinates for Loumbila/Ouaga center
                        lat = 12.3714
                        lng = -1.5197
                        isLocating = false
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurface)
                ) {
                    Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(if (lat != null) "GPS Détecté (12.371, -1.520)" else "Détecter coordonnées GPS")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val area = areaText.toDoubleOrNull() ?: 1.0
                    if (name.isNotBlank()) {
                        onConfirm(name, location, area, climateZone, lat, lng)
                    }
                },
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                modifier = Modifier.testTag("btn_confirm_add_farm")
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}
