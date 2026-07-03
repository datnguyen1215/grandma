<script lang="ts">
	import { onMount } from 'svelte';

	let photos = $state<{ id: number; created_at: string }[]>([]);

	onMount(async () => {
		const res = await fetch('/api/photos');
		photos = await res.json();

		const events = new EventSource('/api/events');
		events.onmessage = async () => {
			const res = await fetch('/api/photos');
			photos = await res.json();
		};
	});
</script>

<svelte:head>
	<title>Grandma Photos</title>
</svelte:head>

<div class="viewer">
	<h1>Photos from Grandma</h1>
	{#if photos.length === 0}
		<p>No photos yet. Waiting...</p>
	{/if}
	<div class="grid">
		{#each photos as photo (photo.id)}
			<div class="photo">
				<a href="/api/photos?id={photo.id}" target="_blank">
					<img src="/api/photos?id={photo.id}" alt="Photo {photo.id}" />
				</a>
				<span class="time">{photo.created_at}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.viewer {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
		font-family: sans-serif;
	}

	h1 {
		font-size: 24px;
		margin-bottom: 20px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.photo {
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	img {
		width: 100%;
		display: block;
	}

	.time {
		display: block;
		padding: 8px;
		font-size: 14px;
		color: #666;
	}
</style>
