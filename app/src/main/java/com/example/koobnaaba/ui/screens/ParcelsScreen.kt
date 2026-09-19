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
import com.example.koobnaaba.data.model.Parcel
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.MintAccent
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel

val SOIL_TYPES = listOf(
    "Argilo-limoneux", "Sablo-limoneux", "Argileux lourd", "Gravillonnaire", "Sableux"
)

val IRRIGATION_SYSTEMS = listOf(
    "Goutte-à-goutte solaire", "Micro-aspersion", "Gravitaire (rigoles)", "Pluvial strict", "Arrosage manuel"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParcelsScreen(
    viewModel: KoobnaabaViewModel,
    modifier: Modifier = Modifier
) {
    val parcels by viewModel.parcels.collectAsState()
    val farms by viewModel.farms.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Parcelles & Cartographie") },
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
                modifier = Modifier.testTag("fab_add_parcel")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter parcelle")
            }
        },
        modifier = modifier
    ) { innerPadding ->
        if (parcels.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.GridOn,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Aucune parcelle enregistrée",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Ajoutez une parcelle pour commencer à planifier vos rotations de cultures.",
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
                items(parcels, key = { it.id }) { parcel ->
                    val farmName = farms.find { it.id == parcel.farmId }?.name ?: "Exploitation"
                    ParcelCard(
                        parcel = parcel,
                        farmName = farmName,
                        onDelete = { viewModel.deleteParcel(parcel) }
                    )
                }
            }
        }

        if (showDialog) {
            AddParcelDialog(
                farms = farms,
                onDismiss = { showDialog = false },
                onConfirm = { farmId, name, area, soil, irrigation, gps ->
                    viewModel.addParcel(farmId, name, area, soil, irrigation, gps)
                    showDialog = false
                }
            )
        }
    }
}

@Composable
fun ParcelCard(
    parcel: Parcel,
    farmName: String,
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
                        text = parcel.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = farmName,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
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
                    Text("%.2f ha".format(parcel.areaHa), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                }
                Column {
                    Text("Sol", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(parcel.soilType, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Irrigation", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(parcel.irrigationType, style = MaterialTheme.typography.bodySmall)
                }
            }

            if (parcel.polygonGps.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Polyline,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = ForestGreenPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            "Polygone GPS 4 sommets capturé",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddParcelDialog(
    farms: List<com.example.koobnaaba.data.model.Farm>,
    onDismiss: () -> Unit,
    onConfirm: (Long, String, Double, String, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var areaText by remember { mutableStateOf("1.0") }
    var selectedFarmId by remember { mutableStateOf(farms.firstOrNull()?.id ?: 0L) }
    var soilType by remember { mutableStateOf(SOIL_TYPES.first()) }
    var irrigationType by remember { mutableStateOf(IRRIGATION_SYSTEMS.first()) }
    var gpsCoords by remember { mutableStateOf("11.177,-4.298; 11.178,-4.297") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouvelle Parcelle") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom de la parcelle") },
                    placeholder = { Text("Ex: Parcelle Oignon Nord") },
                    modifier = Modifier.fillMaxWidth().testTag("input_parcel_name")
                )

                OutlinedTextField(
                    value = areaText,
                    onValueChange = { areaText = it },
                    label = { Text("Superficie (ha)") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = soilType,
                    onValueChange = { soilType = it },
                    label = { Text("Type de sol") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = irrigationType,
                    onValueChange = { irrigationType = it },
                    label = { Text("Système d'irrigation") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val area = areaText.toDoubleOrNull() ?: 1.0
                    if (name.isNotBlank()) {
                        onConfirm(selectedFarmId, name, area, soilType, irrigationType, gpsCoords)
                    }
                },
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                modifier = Modifier.testTag("btn_confirm_add_parcel")
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
