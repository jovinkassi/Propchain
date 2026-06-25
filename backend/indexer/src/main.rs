use anyhow::Result;
use axum::{routing::get, Json, Router};
use dotenv::dotenv;
use ethers::prelude::*;
use serde::Serialize;
use sqlx::PgPool;
use std::{env, sync::Arc};
use tracing::info;

mod indexer;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL required");
    let db = PgPool::connect(&db_url).await?;

    let state = AppState { db: db.clone() };

    // Spawn blockchain event indexer
    let rpc_url = env::var("RPC_URL").expect("RPC_URL required");
    let contract_address: Address = env::var("PROPERTY_TOKEN_ADDRESS")
        .expect("PROPERTY_TOKEN_ADDRESS required")
        .parse()?;

    tokio::spawn(indexer::run(db, rpc_url, contract_address));

    let app = Router::new()
        .route("/health", get(health))
        .route("/status", get(indexer_status))
        .with_state(state);

    let addr = "0.0.0.0:3002";
    info!("Indexer API listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok", service: "propchain-indexer" })
}

async fn indexer_status() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "indexing": true }))
}
