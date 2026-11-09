<script>
	import { classBind, styleBind, transformParse } from '@lynx-svelte/helper';

	let count = $state(0);
	let active = $state(true);
	const rotate = $derived(count * 12);
	const cardClass = $derived(classBind(['card', { 'card-active': active }]));
	const cardStyle = $derived(
		styleBind({
			transform: transformParse({ rotate, scale: active ? 1 : 0.8 }),
			opacity: active ? 1 : 0.6
		})
	);
</script>

<view class="panel">
	<text class="panel-title">Dynamic style</text>
	<text class="summary">classBind + styleBind + transformParse</text>

	<view class={cardClass} style={cardStyle}>
		<text class="card-title">count = {count}</text>
		<text class="card-sub">rotate {rotate}deg</text>
	</view>

	<view class="buttons">
		<view class="button" onbindtap={() => ++count}>
			<text class="button-text">+1</text>
		</view>
		<view class="button" onbindtap={() => (active = !active)}>
			<text class="button-text">{active ? 'Disable' : 'Enable'}</text>
		</view>
	</view>
</view>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	.panel-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #222222;
	}
	.summary {
		font-size: 26rpx;
		color: #777777;
	}
	.card {
		margin-top: 16rpx;
		padding: 40rpx;
		border-radius: 28rpx;
		background-color: #ffffff;
		border: 2rpx solid #ffd9c9;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		align-items: center;
		transition: transform 200ms ease;
	}
	.card-active {
		background: linear-gradient(120deg, #fff1ea 0%, #ffffff 100%);
		border-color: #ff3e00;
	}
	.card-title {
		font-size: 44rpx;
		font-weight: bold;
		color: #ff3e00;
	}
	.card-sub {
		font-size: 26rpx;
		color: #999999;
	}
	.buttons {
		display: flex;
		flex-direction: row;
		gap: 16rpx;
		margin-top: 16rpx;
	}
	.button {
		padding: 18rpx 32rpx;
		border-radius: 18rpx;
		background-color: #222222;
	}
	.button-text {
		font-size: 28rpx;
		color: #ffffff;
	}
</style>
