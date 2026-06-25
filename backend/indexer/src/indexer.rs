use anyhow::Result;
use ethers::prelude::*;
use sqlx::PgPool;
use std::sync::Arc;
use tracing::{error, info};

abigen!(
    PropertyToken,
    r#"[
        event PropertyListed(uint256 indexed propertyId, string name, uint256 totalValue)
        event TokensPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount)
        event RentalYieldDistributed(uint256 indexed propertyId, uint256 amount)
    ]"#
);

pub async fn run(db: PgPool, rpc_url: String, contract_address: Address) -> Result<()> {
    let provider = Provider::<Ws>::connect(&rpc_url).await?;
    let client = Arc::new(provider);
    let contract = PropertyToken::new(contract_address, client.clone());

    info!("Indexer started, listening for events on {:?}", contract_address);

    let property_listed_filter = contract.property_listed_filter();
    let tokens_purchased_filter = contract.tokens_purchased_filter();
    let yield_distributed_filter = contract.rental_yield_distributed_filter();

    let mut property_listed = property_listed_filter.subscribe().await?;
    let mut tokens_purchased = tokens_purchased_filter.subscribe().await?;
    let mut yield_distributed = yield_distributed_filter.subscribe().await?;

    loop {
        tokio::select! {
            Some(Ok(event)) = property_listed.next() => {
                info!("PropertyListed: id={} name={}", event.property_id, event.name);
                if let Err(e) = insert_property(&db, &event).await {
                    error!("Failed to insert property: {}", e);
                }
            }
            Some(Ok(event)) = tokens_purchased.next() => {
                info!("TokensPurchased: property={} buyer={:?} amount={}", event.property_id, event.buyer, event.amount);
                if let Err(e) = upsert_holding(&db, &event).await {
                    error!("Failed to upsert holding: {}", e);
                }
            }
            Some(Ok(event)) = yield_distributed.next() => {
                info!("YieldDistributed: property={} amount={}", event.property_id, event.amount);
                if let Err(e) = record_yield(&db, &event).await {
                    error!("Failed to record yield: {}", e);
                }
            }
        }
    }
}

async fn insert_property(db: &PgPool, event: &PropertyListedFilter) -> Result<()> {
    sqlx::query(
        "INSERT INTO properties (on_chain_id, name, total_value) VALUES ($1, $2, $3) ON CONFLICT (on_chain_id) DO NOTHING"
    )
    .bind(event.property_id.as_u64() as i64)
    .bind(&event.name)
    .bind(event.total_value.as_u128() as i64)
    .execute(db)
    .await?;
    Ok(())
}

async fn upsert_holding(db: &PgPool, event: &TokensPurchasedFilter) -> Result<()> {
    sqlx::query(
        r#"INSERT INTO token_holdings (wallet_address, property_on_chain_id, token_amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (wallet_address, property_on_chain_id)
        DO UPDATE SET token_amount = token_holdings.token_amount + EXCLUDED.token_amount"#
    )
    .bind(format!("{:?}", event.buyer))
    .bind(event.property_id.as_u64() as i64)
    .bind(event.amount.as_u128() as i64)
    .execute(db)
    .await?;
    Ok(())
}

async fn record_yield(db: &PgPool, event: &RentalYieldDistributedFilter) -> Result<()> {
    sqlx::query(
        "INSERT INTO yield_distributions (property_on_chain_id, amount) VALUES ($1, $2)"
    )
    .bind(event.property_id.as_u64() as i64)
    .bind(event.amount.as_u128() as i64)
    .execute(db)
    .await?;
    Ok(())
}
