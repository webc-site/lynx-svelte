<script>
	import { inputBind } from '@lynx-svelte/helper';
	import TodoItem from './TodoItem.svelte';

	let draft = $state('');
	let seed = 1;
	let todos = $state([
		{ id: 1, text: 'Merge svelte#18042', done: true },
		{ id: 2, text: 'Implement Lynx renderer', done: false }
	]);
	const remaining = $derived(todos.filter((item) => !item.done).length);

	const addTodo = () => {
		const text = draft.trim();
		if (text === '') return;
		todos.push({ id: ++seed, text, done: false });
		draft = '';
	};

	const toggleTodo = (id) => {
		const todo = todos.find((item) => item.id === id);
		if (todo != null) todo.done = !todo.done;
	};

	const removeTodo = (id) => {
		todos = todos.filter((item) => item.id !== id);
	};
</script>

<view class="panel">
	<text class="panel-title">Todo list</text>
	<text class="summary">{remaining} remaining / {todos.length} total</text>

	<view class="input-row">
		<input class="input" placeholder="What next?" onbindinput={inputBind((value) => (draft = value))} />
		<view class="add" onbindtap={addTodo}>
			<text class="add-text">Add</text>
		</view>
	</view>

	<view class="list">
		{#each todos as todo (todo.id)}
			<TodoItem {todo} ontoggle={() => toggleTodo(todo.id)} onremove={() => removeTodo(todo.id)} />
		{:else}
			<text class="empty">Nothing to do yet.</text>
		{/each}
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
	.input-row {
		display: flex;
		flex-direction: row;
		gap: 12rpx;
		margin-top: 8rpx;
	}
	.input {
		flex: 1;
		height: 84rpx;
		padding: 0 24rpx;
		border-radius: 20rpx;
		background-color: #ffffff;
		border: 1rpx solid #e5e5e5;
		font-size: 30rpx;
	}
	.add {
		padding: 0 32rpx;
		height: 84rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20rpx;
		background-color: #ff3e00;
	}
	.add-text {
		color: #ffffff;
		font-size: 30rpx;
		font-weight: bold;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
		margin-top: 8rpx;
	}
	.empty {
		font-size: 28rpx;
		color: #999999;
		padding: 24rpx 0;
	}
</style>
