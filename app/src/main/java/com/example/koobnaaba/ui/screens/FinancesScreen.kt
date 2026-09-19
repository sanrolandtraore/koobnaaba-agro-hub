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
import com.example.koobnaaba.ui.theme.BurntAmber
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.Terracotta
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel
import java.text.NumberFormat
import java.util.Locale

val EXPENSE_CATEGORIES = listOf(
    "Semences", "Engrais & Phyto", "Main d'oeuvre", "Carburant & Énergie", "Irrigation", "Équipement", "Aliments bétail", "Soins vétérinaires", "Autre"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinancesScreen(
    viewModel: KoobnaabaViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val costs by viewModel.costs.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    val fcfa = remember { NumberFormat.getNumberInstance(Locale.FRANCE) }

    val totalCosts = costs.sumOf { it.amount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Comptabilité & Charges") },
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
                modifier = Modifier.testTag("fab_add_cost")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter dépense")
            }
        },
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder(),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            "Total des Charges Réalisées",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "${fcfa.format(totalCosts)} FCFA",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = Terracotta
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "${costs.size} lignes de dépenses enregistrées",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            item {
                Text(
                    "Historique des Dépenses",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            if (costs.isEmpty()) {
                item {
                    Text(
                        "Aucune charge enregistrée.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                items(costs, key = { it.id }) { cost ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = CardDefaults.outlinedCardBorder(),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    cost.category,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = BurntAmber,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    cost.description,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Medium)
                                )
                                Text(
                                    cost.date,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                "${fcfa.format(cost.amount)} F",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Terracotta
                            )
                            IconButton(onClick = { viewModel.deleteCost(cost) }) {
                                Icon(Icons.Default.DeleteOutline, contentDescription = "Supprimer", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }

        if (showDialog) {
            AddCostDialog(
                onDismiss = { showDialog = false },
                onConfirm = { cat, desc, amount, date ->
                    viewModel.addCost(cat, desc, amount, date)
                    showDialog = false
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddCostDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, Double, String) -> Unit
) {
    var category by remember { mutableStateOf(EXPENSE_CATEGORIES.first()) }
    var description by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("19/09/2026") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouvelle Dépense") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Catégorie") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Libellé") },
                    placeholder = { Text("Ex: Achat urée 50kg, carburant motopompe") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Montant (FCFA)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.toDoubleOrNull() ?: 0.0
                    if (description.isNotBlank() && amount > 0) {
                        onConfirm(category, description, amount, date)
                    }
                },
                enabled = description.isNotBlank() && amountText.isNotBlank(),
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
