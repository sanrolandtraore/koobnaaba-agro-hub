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
import com.example.koobnaaba.data.model.ActivityLog
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.Terracotta
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel
import java.text.NumberFormat
import java.util.Locale

val ACTIVITY_TYPES = listOf(
    "Semis", "Irrigation", "Fertilisation", "Sarclage", "Traitement phyto", "Taille", "Récolte", "Autre"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActivitiesScreen(
    viewModel: KoobnaabaViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val activities by viewModel.activities.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    val fcfaFormatter = remember { NumberFormat.getNumberInstance(Locale.FRANCE) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Journal des Activités") },
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
                modifier = Modifier.testTag("fab_add_activity")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Nouvelle intervention")
            }
        },
        modifier = modifier
    ) { innerPadding ->
        if (activities.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(innerPadding).padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "Aucune intervention enregistrée. Utilisez le bouton + pour consigner vos travaux champêtres.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(innerPadding).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(activities, key = { it.id }) { activity ->
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
                                        text = activity.activityType,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = activity.date,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = activity.description,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            if (activity.costAmount > 0) {
                                Text(
                                    text = "${fcfaFormatter.format(activity.costAmount)} F",
                                    style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = Terracotta
                                )
                            }
                            IconButton(onClick = { viewModel.deleteActivity(activity) }) {
                                Icon(
                                    Icons.Default.DeleteOutline,
                                    contentDescription = "Supprimer",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                }
            }
        }

        if (showDialog) {
            AddActivityDialog(
                onDismiss = { showDialog = false },
                onConfirm = { type, desc, date, cost ->
                    viewModel.addActivity(null, null, type, desc, date, cost)
                    showDialog = false
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddActivityDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, Double) -> Unit
) {
    var selectedType by remember { mutableStateOf(ACTIVITY_TYPES.first()) }
    var description by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("19/09/2026") }
    var costText by remember { mutableStateOf("0") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouvelle Intervention") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = selectedType,
                    onValueChange = { selectedType = it },
                    label = { Text("Type d'intervention") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Détails / Description") },
                    placeholder = { Text("Ex: Épandage urée 50kg, désherbage...") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = costText,
                    onValueChange = { costText = it },
                    label = { Text("Coût associé en FCFA (optionnel)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val cost = costText.toDoubleOrNull() ?: 0.0
                    onConfirm(selectedType, description, date, cost)
                },
                enabled = description.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
}
