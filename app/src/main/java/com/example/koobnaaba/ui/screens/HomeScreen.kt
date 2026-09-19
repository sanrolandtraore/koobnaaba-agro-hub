package com.example.koobnaaba.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.koobnaaba.ui.navigation.Screen
import com.example.koobnaaba.ui.theme.*
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: KoobnaabaViewModel,
    onNavigateTo: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val farms by viewModel.farms.collectAsState()
    val parcels by viewModel.parcels.collectAsState()
    val activeCycles by viewModel.activeCycles.collectAsState()
    val activities by viewModel.activities.collectAsState()
    val costs by viewModel.costs.collectAsState()
    val activeAnimals by viewModel.activeAnimals.collectAsState()

    val totalAreaHa = parcels.sumOf { it.areaHa }
    val totalCosts = costs.sumOf { it.amount }
    val totalAnimalsCount = activeAnimals.sumOf { if (it.isGroup) it.groupSize else 1 }

    val fcfaFormatter = remember {
        NumberFormat.getNumberInstance(Locale.FRANCE)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Koobnaaba",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Hub Agricole & Élevage Intelligent",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = LightSage,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(MintAccent)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Hors-Ligne OK",
                                style = MaterialTheme.typography.labelSmall,
                                color = DarkForestGreen,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                // Welcome Banner
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = ForestGreenPrimary),
                    modifier = Modifier.fillMaxWidth().testTag("welcome_banner")
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "Tableau de Bord Exploitant",
                            style = MaterialTheme.typography.titleMedium,
                            color = LightSage
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Gestion intégrée parcelles, cultures et bétail au Sahel",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = { onNavigateTo(Screen.Parcels.route) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = SunGold,
                                    contentColor = DeepJungle
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.testTag("action_new_parcel")
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Parcelles", fontWeight = FontWeight.SemiBold)
                            }
                            OutlinedButton(
                                onClick = { onNavigateTo(Screen.Calculator.route) },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.testTag("action_calculator")
                            ) {
                                Icon(Icons.Default.Calculate, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Calculateur")
                            }
                        }
                    }
                }
            }

            // Quick Stats Grid
            item {
                Text(
                    text = "Vue d'ensemble",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatMetricCard(
                        title = "Exploitations",
                        value = "${farms.size}",
                        subtitle = "Fermes actives",
                        icon = Icons.Default.Landscape,
                        color = ForestGreenPrimary,
                        modifier = Modifier.weight(1f).clickable { onNavigateTo(Screen.Farms.route) }
                    )
                    StatMetricCard(
                        title = "Superficie",
                        value = "%.1f ha".format(totalAreaHa),
                        subtitle = "${parcels.size} parcelles",
                        icon = Icons.Default.GridOn,
                        color = MintAccent,
                        modifier = Modifier.weight(1f).clickable { onNavigateTo(Screen.Parcels.route) }
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatMetricCard(
                        title = "Cycles En Cours",
                        value = "${activeCycles.size}",
                        subtitle = "Cultures actives",
                        icon = Icons.Default.Eco,
                        color = BurntAmber,
                        modifier = Modifier.weight(1f).clickable { onNavigateTo(Screen.Crops.route) }
                    )
                    StatMetricCard(
                        title = "Cheptel Bétail",
                        value = "$totalAnimalsCount",
                        subtitle = "Têtes enregistrées",
                        icon = Icons.Default.Pets,
                        color = Terracotta,
                        modifier = Modifier.weight(1f).clickable { onNavigateTo(Screen.Livestock.route) }
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                StatMetricCard(
                    title = "Dépenses Cumulées (FCFA)",
                    value = "${fcfaFormatter.format(totalCosts)} F",
                    subtitle = "${costs.size} entrées comptabilisées",
                    icon = Icons.Default.AccountBalanceWallet,
                    color = OchreEarth,
                    modifier = Modifier.fillMaxWidth().clickable { onNavigateTo(Screen.Finances.route) }
                )
            }

            // Quick Navigation Shortcuts
            item {
                Text(
                    text = "Modules de Gestion",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val modules = listOf(
                        Triple("Fermes", Icons.Default.Landscape, Screen.Farms.route),
                        Triple("Parcelles", Icons.Default.GridOn, Screen.Parcels.route),
                        Triple("Cultures", Icons.Default.Eco, Screen.Crops.route),
                        Triple("Activités", Icons.Default.Assignment, Screen.Activities.route),
                        Triple("Finances", Icons.Default.AccountBalanceWallet, Screen.Finances.route),
                        Triple("Élevage", Icons.Default.Pets, Screen.Livestock.route),
                        Triple("Calculateur", Icons.Default.Calculate, Screen.Calculator.route)
                    )
                    items(modules) { (title, icon, route) ->
                        ElevatedCard(
                            onClick = { onNavigateTo(route) },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .width(115.dp)
                                .height(95.dp)
                                .testTag("shortcut_$route")
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = title,
                                    tint = ForestGreenPrimary,
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = title,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            // Recent Activities
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Activités Récentes",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    TextButton(
                        onClick = { onNavigateTo(Screen.Activities.route) },
                        modifier = Modifier.testTag("btn_see_all_activities")
                    ) {
                        Text("Voir tout")
                    }
                }

                if (activities.isEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                            Text(
                                "Aucune activité enregistrée pour le moment.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        activities.take(4).forEach { activity ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = CardDefaults.outlinedCardBorder()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(LightSage),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = when (activity.activityType) {
                                                "Semis" -> Icons.Default.Grass
                                                "Irrigation" -> Icons.Default.WaterDrop
                                                "Fertilisation" -> Icons.Default.Science
                                                "Récolte" -> Icons.Default.ShoppingBag
                                                else -> Icons.Default.CheckCircle
                                            },
                                            contentDescription = null,
                                            tint = ForestGreenPrimary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = activity.activityType,
                                            style = MaterialTheme.typography.titleMedium.copy(fontSize = 15.sp),
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Text(
                                            text = activity.description,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = activity.date,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        if (activity.costAmount > 0) {
                                            Text(
                                                text = "${fcfaFormatter.format(activity.costAmount)} F",
                                                style = MaterialTheme.typography.labelMedium,
                                                fontWeight = FontWeight.Bold,
                                                color = Terracotta
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun StatMetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(color.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = color,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
