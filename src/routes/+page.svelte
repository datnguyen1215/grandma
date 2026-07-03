<script lang="ts">
	import { onMount } from 'svelte';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let status = $state('Starting camera...');
	let sending = $state(false);
	let cameraReady = $state(false);

	async function startCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
			});
			video.srcObject = stream;
			await video.play();
			cameraReady = true;
			status = 'Tap anywhere to take photo';
		} catch {
			status = 'Camera blocked. Tap to allow camera access.';
		}
	}

	onMount(() => {
		status = 'Tap anywhere to start camera';
	});

	async function capture() {
		if (!cameraReady) {
			await startCamera();
			return;
		}
		if (sending) return;
		sending = true;
		status = 'Sending...';

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext('2d')!.drawImage(video, 0, 0);

		const blob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85)
		);

		const form = new FormData();
		form.append('photo', blob, 'photo.jpg');

		try {
			const res = await fetch('/api/upload', { method: 'POST', body: form });
			if (res.ok) {
				status = 'Sent! Tap again for another photo';
			} else {
				status = 'Failed to send. Tap to try again.';
			}
		} catch {
			status = 'No internet. Tap to try again.';
		}

		sending = false;
	}
</script>

<svelte:head>
	<title>Grandma Camera</title>
	<link rel="manifest" href="/manifest.json" />
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
	<meta name="theme-color" content="#000000" />
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="camera" onclick={capture}>
	<video bind:this={video} playsinline muted></video>
	<canvas bind:this={canvas} style="display:none"></canvas>
	<div class="status" class:sending>{status}</div>
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background: #000;
		height: 100%;
	}

	.camera {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.status {
		position: fixed;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 16px 32px;
		border-radius: 999px;
		font-size: 20px;
		font-family: sans-serif;
		white-space: nowrap;
		pointer-events: none;
	}

	.sending {
		background: rgba(255, 165, 0, 0.8);
	}
</style>
